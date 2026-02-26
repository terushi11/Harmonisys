'use client';

import { useState, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Checkbox,
} from '@heroui/react';
import type { UnahonModalProps } from '@/types';
import { unahonSections } from '@/constants';

const UnahonModal: React.FC<UnahonModalProps> = ({
    index,
    rowNumber,
    competency,
    isOpen,
    onOpenChange,
    onDone,
    onCancel,
}) => {
    const [checkboxValues, setCheckboxValues] = useState<boolean[]>([]);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [relevantIndices, setRelevantIndices] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            const initialCheckboxes = unahonSections[index].interventions[
                rowNumber
            ].checklist.map(() => false);
            setCheckboxValues(initialCheckboxes);

            const relevantIndexList = unahonSections[index].interventions[
                rowNumber
            ].checklist
                .map((_, i) => {
                    return unahonSections[index].interventions[
                        rowNumber
                    ].competencies[i].includes(competency)
                        ? i
                        : -1;
                })
                .filter((i) => i !== -1);

            setRelevantIndices(relevantIndexList);
            setIsButtonDisabled(true);
        }
    }, [isOpen, index, rowNumber, competency]);

    useEffect(() => {
        const relevantChecked = relevantIndices.every(
            (index) => checkboxValues[index] === true
        );
        setIsButtonDisabled(!relevantChecked || relevantIndices.length === 0);
    }, [checkboxValues, relevantIndices]);

    const handleCheckboxChange = (index: number) => (isSelected: boolean) => {
        setCheckboxValues((prev) => {
            const updatedCheckboxes = [...prev];
            updatedCheckboxes[index] = isSelected;
            return updatedCheckboxes;
        });
    };

    const handleCancel = () => {
        onCancel();
    };

    return (
        <div>
            <Modal
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCancel();
                    }
                    onOpenChange();
                }}
                size="2xl"
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                classNames={{
                    backdrop:
                        'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
                    base: 'border-[#292f46] bg-gradient-to-br from-white via-white to-slate-50',
                    header: 'border-b-[1px] border-slate-200',
                    body: 'py-6',
                    footer: 'border-t-[1px] border-slate-200',
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                                        <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 bg-clip-text text-transparent">
                                            Intervention Checklist
                                        </h2>
                                        <p className="text-slate-600 text-sm font-medium">
                                            Complete required interventions
                                        </p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    {(() => {
                                        const hasMatchingInterventions =
                                            unahonSections[index].interventions[
                                                rowNumber
                                            ].checklist.some((_, i) =>
                                                unahonSections[
                                                    index
                                                ].interventions[
                                                    rowNumber
                                                ].competencies[i].includes(
                                                    competency
                                                )
                                            );

                                        if (!hasMatchingInterventions) {
                                            return (
                                                <div className="p-8 text-center text-gray-400 text-lg italic">
                                                    No interventions applicable
                                                    for this competency
                                                </div>
                                            );
                                        }

                                        return unahonSections[
                                            index
                                        ].interventions[
                                            rowNumber
                                        ].checklist.map(
                                            (intervention, checklist_index) => {
                                                if (
                                                    unahonSections[
                                                        index
                                                    ].interventions[
                                                        rowNumber
                                                    ].competencies[
                                                        checklist_index
                                                    ].includes(competency)
                                                ) {
                                                    return (
                                                        <div
                                                            key={
                                                                checklist_index
                                                            }
                                                            className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300"
                                                        >
                                                            <div className="flex gap-4 items-start">
                                                                <Checkbox
                                                                    isSelected={
                                                                        checkboxValues[
                                                                            checklist_index
                                                                        ] ??
                                                                        false
                                                                    }
                                                                    onValueChange={handleCheckboxChange(
                                                                        checklist_index
                                                                    )}
                                                                    classNames={{
                                                                        base: 'max-w-none',
                                                                        wrapper:
                                                                            'before:border-emerald-300 after:bg-emerald-500',
                                                                    }}
                                                                />
                                                                <div
                                                                    className="flex-1 text-slate-700 leading-relaxed"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: intervention,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }
                                        );
                                    })()}
                                </div>
                            </ModalBody>
                            <ModalFooter className="gap-3">
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                    className="font-semibold hover:bg-red-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onPress={onDone}
                                    isDisabled={(() => {
                                        const hasMatchingInterventions =
                                            unahonSections[index].interventions[
                                                rowNumber
                                            ].checklist.some((_, i) =>
                                                unahonSections[
                                                    index
                                                ].interventions[
                                                    rowNumber
                                                ].competencies[i].includes(
                                                    competency
                                                )
                                            );

                                        return (
                                            hasMatchingInterventions &&
                                            isButtonDisabled
                                        );
                                    })()}
                                    className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    Complete Intervention
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default UnahonModal;
