'use client';

import { Button, useDisclosure, Card, CardBody, Skeleton } from '@heroui/react';
import UnahonTable from './UnahonTable';
import { useCallback, useEffect, useState } from 'react';
import { unahonSections } from '@/constants';
import { AssessmentType } from '@prisma/client';
import UnahonConfidential from './UnahonConfidential';
import UnahonGuide from './UnahonGuide';
import { createId } from '@paralleldrive/cuid2';
import type { UnahonProps, Row, ConfidentialForm } from '@/types';
import { saveUnahonForm } from '@/lib/action/unahon';
import { useRouter } from 'next/navigation';
import MHPSSLevel from '@/components/MHPSS';
import SuccessDialog from '../SuccessDialog';
import UnahonConfirmModal from './UnahonConfirmModal';

const Unahon: React.FC<UnahonProps> = ({
    session,
    isViewOnly,
    isReassessment,
    responder = session.user.name!,
    unahonChecklist,
    clientConfidentialForm,
    onReturnToManagement,
}) => {
    const router = useRouter();
    const [checklist, setChecklist] = useState<{
        [category: number]: { [key: number]: [a: boolean, b: boolean] };
    }>({});
    const [confidentialForm, setConfidentialForm] = useState<ConfidentialForm>({
        client: createId(),
        userId: session.user.id!,
        date: new Date(),
        affiliation: '',
        assessmentType: AssessmentType.INITIAL_ASSESSMENT,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const goToPreviousSection = useCallback(() => {
        if (currentIndex === unahonSections.length) {
            // If on confidential page, go back to last section
            setCurrentIndex(unahonSections.length - 1);
        } else {
            setCurrentIndex((prevIndex) =>
                prevIndex === 0 ? unahonSections.length - 1 : prevIndex - 1
            );
        }
    }, [currentIndex]);

    const goToNextSection = useCallback(() => {
        if (currentIndex === unahonSections.length - 1) {
            setCurrentIndex(unahonSections.length);
        } else {
            setCurrentIndex((prevIndex) =>
                prevIndex === unahonSections.length - 1 ? 0 : prevIndex + 1
            );
        }
    }, [currentIndex]);

    const goToConfidentialPage = () => {
        setCurrentIndex(unahonSections.length);
    };

    const handleExitAssessment = () => {
        if (onReturnToManagement) {
            onReturnToManagement();
        } else {
            router.push('/unahon');
        }
    };

    const handleSubmit = async () => {
        try {
            await saveUnahonForm({ ...confidentialForm, checklist });
        } catch {
            console.error('Error saving Unahon form');
        } finally {
            setShowSuccessDialog(true);
        }
    };

    const handleOpenConfirmModal = () => {
        console.log('Opening confirm modal');
        setShowConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false);
        await handleSubmit();
    };

    useEffect(() => {
        setChecklist(() => {
            if (unahonChecklist) {
                setIsLoading(false);
                return unahonChecklist;
            }

            const initialChecklist: {
                [category: number]: { [key: number]: [a: boolean, b: boolean] };
            } = {};

            unahonSections.forEach((section, section_index) => {
                initialChecklist[section_index] = {};
                section.questions.forEach((question: Row) => {
                    initialChecklist[section_index][question.number] = [
                        false,
                        false,
                    ];
                });
            });

            setIsLoading(false);

            return initialChecklist;
        });

        setConfidentialForm((prevForm) => {
            return clientConfidentialForm ?? prevForm;
        });
    }, [unahonChecklist, clientConfidentialForm]);

    const handleChecklistChange = (rowNumber: number, column: number) => {
        setChecklist((prev) => ({
            ...prev,

            [currentIndex]: {
                ...prev[currentIndex],
                [rowNumber]:
                    column === 0
                        ? [!prev[currentIndex][rowNumber][0], false]
                        : [false, !prev[currentIndex][rowNumber][1]],
            },
        }));
    };

    const handleConfidentialFormChange = (id: string, value: any) => {
        setConfidentialForm((prevData) => ({ ...prevData, [id]: value }));
    };

    const isNextButtonDisabled = useCallback(() => {
        if (isViewOnly) return false;
        if (!checklist[currentIndex]) return true;

        const currentSectionQuestions = unahonSections[currentIndex].questions;

        const allDisagreeChecked = currentSectionQuestions.every(
            (question: Row) => {
                return checklist[currentIndex][question.number][1] === true;
            }
        );

        return !allDisagreeChecked;
    }, [checklist, currentIndex, isViewOnly]);

    const isPreviousButtonDisabled = useCallback(() => {
        if (isViewOnly) return false;
        // Previous button is now always enabled except when on first page and not view-only
        return currentIndex === 0;
    }, [currentIndex, isViewOnly]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header Section */}
                <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
                    <CardBody className="p-6">
                        {isViewOnly && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
                                <p className="text-xl font-bold text-red-600 text-center flex items-center justify-center gap-2">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                    VIEW ONLY MODE
                                </p>
                            </div>
                        )}

                        {/* Add reassessment indicator */}
                        {isReassessment && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                                <p className="text-xl font-bold text-blue-600 text-center flex items-center justify-center gap-2">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                    REASSESSMENT MODE
                                </p>
                            </div>
                        )}

                        <div className="text-center space-y-4">
                            <div className="flex justify-center items-center gap-2 mb-4">
                                <h1 className="text-5xl lg:text-6xl px-2 font-black bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 bg-clip-text text-transparent">
                                    UN<span className="italic">AHON</span>
                                </h1>
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
                                BEHAVIOR OBSERVATION CHECKLIST FOR RESOURCE
                                PRIORITIZATION
                            </h2>

                            <div className="max-w-4xl mx-auto space-y-4 text-slate-700">
                                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                    <CardBody className="p-4">
                                        <p className="text-lg leading-relaxed">
                                            Isa itong gamit upang mahanap ang
                                            pinakanangangailangan ng serbisyo sa
                                            mga evacuation camps.{' '}
                                            <span className="font-bold text-red-600 underline decoration-red-300">
                                                Hindi ito gagamiting pangtukoy
                                                ng mga sakit-pangkaisipan
                                            </span>
                                            .
                                        </p>
                                        <p className="text-base italic text-slate-600 mt-2">
                                            (This is a tool that seeks to
                                            prioritize resources in cases
                                            wherein there is a great demand that
                                            exceeds current resources at
                                            evacuation camps.{' '}
                                            <span className="font-bold underline">
                                                This is not a diagnostic tool
                                            </span>
                                            .)
                                        </p>
                                    </CardBody>
                                </Card>

                                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                                    <CardBody className="p-4">
                                        <p className="text-lg leading-relaxed">
                                            Ibatay ang sagot sa mga
                                            naobserbahang kilos.{' '}
                                            <span className="font-bold text-red-600 underline decoration-red-300">
                                                Huwag tuwirang itanong ang mga
                                                ito sa mga Internally Displaced
                                                Persons o IDP
                                            </span>
                                            . Sagutan ang mga aytem nang
                                            sunod-sunod mula sa itaas hanggang
                                            sa ibaba. Kung OO ang sagot sa isa
                                            sa mga aytem, HUMINTO at isagawa ang
                                            interbensyon.
                                        </p>
                                        <p className="text-base italic text-slate-600 mt-2">
                                            (Base the answers on observable
                                            behaviors.{' '}
                                            <span className="font-bold underline">
                                                Do not directly ask these
                                                questions to the internally
                                                displaced person (IDP)
                                            </span>
                                            . Answer the items in order from top
                                            to bottom. If you answered YES to
                                            any of the items, STOP and do the
                                            intervention.)
                                        </p>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Controls Section */}
                <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
                    <CardBody className="p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onPress={onOpen}
                                    className="font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    size="lg"
                                    startContent={
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    }
                                >
                                    MHPSS Level Legend
                                </Button>

                                <Button
                                    onPress={handleExitAssessment}
                                    variant="bordered"
                                    className="font-semibold border-2 border-red-300 text-red-700 hover:bg-red-50 transition-all duration-300"
                                    size="lg"
                                    startContent={
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                            />
                                        </svg>
                                    }
                                >
                                    Exit Assessment
                                </Button>
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-600">
                                    Progress:
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${
                                                isReassessment
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                            }`}
                                            style={{
                                                width: `${((currentIndex + 1) / (unahonSections.length + 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">
                                        {currentIndex + 1}/
                                        {unahonSections.length + 1}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Main Content */}
                <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
                    <CardBody className="p-6">
                        {!isLoading ? (
                            currentIndex < unahonSections.length ? (
                                <div className="w-full overflow-x-auto">
                                    <UnahonTable
                                        isViewOnly={isViewOnly}
                                        index={currentIndex}
                                        key={currentIndex}
                                        checklist={checklist}
                                        handleChecklistChange={
                                            handleChecklistChange
                                        }
                                        competency={session.user.competency!}
                                        goToConfidentialPage={
                                            goToConfidentialPage
                                        }
                                    />
                                </div>
                            ) : (
                                <UnahonConfidential
                                    isViewOnly={isViewOnly}
                                    isReassessment={isReassessment}
                                    confidentialForm={confidentialForm}
                                    handleConfidentialFormChange={
                                        handleConfidentialFormChange
                                    }
                                    responder={responder}
                                />
                            )
                        ) : (
                            <div className="space-y-6">
                                {/* Skeleton for table header */}
                                <div className="flex gap-4 pb-4 border-b border-slate-200">
                                    {[120, 100, 140, 90, 110].map(
                                        (width, index) => (
                                            <Skeleton
                                                key={index}
                                                className="h-6 rounded-lg"
                                                style={{ width: `${width}px` }}
                                            ></Skeleton>
                                        )
                                    )}
                                </div>

                                {/* Skeleton for table rows */}
                                {Array.from({ length: 8 }).map(
                                    (_, rowIndex) => (
                                        <div
                                            key={rowIndex}
                                            className="space-y-4 py-4 border-b border-slate-100"
                                        >
                                            {/* Question row skeleton */}
                                            <div className="flex gap-4 items-start">
                                                <Skeleton className="w-8 h-6 rounded-lg flex-shrink-0"></Skeleton>
                                                <div className="flex-1">
                                                    <Skeleton className="w-full h-6 rounded-lg mb-2"></Skeleton>
                                                    <Skeleton className="w-3/4 h-4 rounded-lg"></Skeleton>
                                                </div>
                                            </div>

                                            {/* Checkbox row skeleton */}
                                            <div className="flex gap-8 ml-12">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="w-4 h-4 rounded"></Skeleton>
                                                    <Skeleton className="w-16 h-4 rounded-lg"></Skeleton>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="w-4 h-4 rounded"></Skeleton>
                                                    <Skeleton className="w-20 h-4 rounded-lg"></Skeleton>
                                                </div>
                                            </div>

                                            {/* Intervention skeleton */}
                                            <div className="ml-12">
                                                <Skeleton className="w-full h-8 rounded-lg"></Skeleton>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Navigation Controls */}
                <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
                    <CardBody className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            {/* Exit Assessment Button - Leftmost */}
                            <Button
                                onPress={handleExitAssessment}
                                variant="bordered"
                                className="font-semibold border-2 border-red-300 text-red-700 hover:bg-red-50 transition-all duration-300"
                                size="lg"
                                startContent={
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                }
                            >
                                Exit Assessment
                            </Button>

                            {/* Navigation Buttons - Right side */}
                            <div className="flex gap-4">
                                {currentIndex === unahonSections.length ? (
                                    <>
                                        <Button
                                            onPress={goToPreviousSection}
                                            variant="bordered"
                                            className="font-semibold border-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300 min-w-[120px]"
                                            size="lg"
                                            startContent={
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                            }
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            isDisabled={isViewOnly}
                                            onPress={handleOpenConfirmModal}
                                            className={`font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-300 hover:-translate-y-1 min-w-[140px] ${
                                                isReassessment
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                                            }`}
                                            size="lg"
                                        >
                                            {isReassessment
                                                ? 'Submit Reassessment'
                                                : 'Submit Assessment'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onPress={goToPreviousSection}
                                            variant="bordered"
                                            className="font-semibold border-2 border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all duration-300 min-w-[120px]"
                                            size="lg"
                                            isDisabled={isPreviousButtonDisabled()}
                                            startContent={
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                            }
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            onPress={goToNextSection}
                                            className="font-bold bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-300 hover:-translate-y-1 min-w-[120px]"
                                            size="lg"
                                            isDisabled={isNextButtonDisabled()}
                                            endContent={
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            }
                                        >
                                            Next
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Guide Section */}
                {currentIndex !== unahonSections.length && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                            Assessment Guidelines
                        </h2>

                        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300">
                            <CardBody className="p-8">
                                <UnahonGuide page={currentIndex + 1} />
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* MHPSS Modal */}
                <MHPSSLevel isOpen={isOpen} onOpenChange={onOpenChange} />

                <SuccessDialog
                    open={showSuccessDialog}
                    onClose={() => {
                        setShowSuccessDialog(false);
                        handleExitAssessment();
                    }}
                />
                {/* Confirmation Modal */}
                <UnahonConfirmModal
                    isOpen={showConfirmModal}
                    onClose={handleCloseConfirmModal}
                    onConfirm={handleConfirmSubmit}
                />
            </div>
        </div>
    );
};

export default Unahon;
