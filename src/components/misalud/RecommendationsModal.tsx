'use client';

import type React from 'react';

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Accordion,
    AccordionItem,
    Chip,
    Card,
    CardBody,
} from '@heroui/react';
import {
    Heart,
    Calendar,
    Users,
    AlertTriangle,
    CheckCircle,
    Clock,
    Sparkles,
    X,
    User,
} from 'lucide-react';
import type { QuestionnaireFormData, Recommendation } from '@/types';

interface RecommendationsModalProps {
    open: boolean;
    onClose: () => void;
    recommendations: Recommendation[];
    formData: QuestionnaireFormData;
}

const RecommendationsModal: React.FC<RecommendationsModalProps> = ({
    open,
    onClose,
    recommendations,
    formData,
}) => {
    const getUrgencyColor = (category: string) => {
        switch (category) {
            case 'red':
                return 'danger';
            case 'yellow':
                return 'warning';
            case 'green':
                return 'success';
            default:
                return 'default';
        }
    };

    const getUrgencyLabel = (category: string) => {
        switch (category) {
            case 'red':
                return 'Urgent';
            case 'yellow':
                return 'Caution';
            case 'green':
                return 'General';
            default:
                return 'General';
        }
    };

    const getUrgencyIcon = (category: string) => {
        switch (category) {
            case 'red':
                return <AlertTriangle className="w-4 h-4" />;
            case 'yellow':
                return <Clock className="w-4 h-4" />;
            case 'green':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <CheckCircle className="w-4 h-4" />;
        }
    };

    const getCategoryGradient = (category: string) => {
        switch (category) {
            case 'red':
                return 'from-red-50 to-rose-50 border-red-200';
            case 'yellow':
                return 'from-amber-50 to-yellow-50 border-amber-200';
            case 'green':
                return 'from-emerald-50 to-teal-50 border-emerald-200';
            default:
                return 'from-gray-50 to-slate-50 border-gray-200';
        }
    };

    const urgentCount = recommendations.filter(
        (r) => r.category === 'red'
    ).length;
    const cautionCount = recommendations.filter(
        (r) => r.category === 'yellow'
    ).length;
    const generalCount = recommendations.filter(
        (r) => r.category === 'green'
    ).length;

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            size="4xl"
            scrollBehavior="inside"
            classNames={{
                base: 'max-h-[95vh]',
                backdrop: 'bg-black/60 backdrop-blur-sm',
                wrapper: 'z-50',
            }}
        >
            <ModalContent className="bg-white/95 backdrop-blur-sm shadow-2xl border border-white/20">
                <ModalHeader className="pb-2 border-b border-gray-100">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                                    Your Health Recommendations
                                </h2>
                                <p className="text-sm text-gray-600 font-medium">
                                    Personalized wellness insights based on your
                                    assessment
                                </p>
                            </div>
                        </div>

                        <Button
                            isIconOnly
                            variant="light"
                            onPress={onClose}
                            className="hover:bg-gray-100 transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        </Button>
                    </div>
                </ModalHeader>

                <ModalBody className="py-6">
                    <div className="space-y-6">
                        {/* User Information Card */}
                        <Card className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/50 shadow-sm">
                            <CardBody className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <User className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Name
                                            </p>
                                            <p className="font-semibold text-gray-800">
                                                {formData.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-teal-100 rounded-lg">
                                            <Calendar className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Assessment Date
                                            </p>
                                            <p className="font-semibold text-gray-800">
                                                {formData.date.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-cyan-100 rounded-lg">
                                            <Users className="w-4 h-4 text-cyan-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Team
                                            </p>
                                            <p className="font-semibold text-gray-800">
                                                {formData.team}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {urgentCount > 0 && (
                                <Card className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200">
                                    <CardBody className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                            <span className="text-2xl font-bold text-red-700">
                                                {urgentCount}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-red-600">
                                            Urgent Actions
                                        </p>
                                    </CardBody>
                                </Card>
                            )}

                            {cautionCount > 0 && (
                                <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                                    <CardBody className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                            <span className="text-2xl font-bold text-amber-700">
                                                {cautionCount}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-amber-600">
                                            Areas of Caution
                                        </p>
                                    </CardBody>
                                </Card>
                            )}

                            {generalCount > 0 && (
                                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                                    <CardBody className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <span className="text-2xl font-bold text-emerald-700">
                                                {generalCount}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-emerald-600">
                                            General Tips
                                        </p>
                                    </CardBody>
                                </Card>
                            )}
                        </div>

                        {/* Introduction */}
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200/50">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-800 mb-1">
                                    Your Personalized Wellness Plan
                                </h3>
                                <p className="text-blue-700 text-sm leading-relaxed">
                                    Based on your responses, we&apos;ve created
                                    tailored recommendations to support your
                                    wellbeing journey. Each recommendation is
                                    categorized by priority to help you focus on
                                    what matters most.
                                </p>
                            </div>
                        </div>

                        {/* Recommendations Section */}
                        {recommendations && recommendations.length > 0 ? (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    Your Recommendations
                                </h3>

                                <Accordion
                                    variant="splitted"
                                    selectionMode="multiple"
                                    className="space-y-2"
                                    defaultExpandedKeys={[
                                        `recommendation-0-${recommendations[0]?.title}`,
                                    ]}
                                >
                                    {recommendations.map(
                                        (recommendation, index) => (
                                            <AccordionItem
                                                key={`recommendation-${index}-${recommendation.title}`}
                                                aria-label={`Recommendation: ${recommendation.title}`}
                                                title={
                                                    <div className="flex items-center gap-3 py-1">
                                                        <Chip
                                                            color={getUrgencyColor(
                                                                recommendation.category
                                                            )}
                                                            variant="flat"
                                                            size="sm"
                                                            startContent={getUrgencyIcon(
                                                                recommendation.category
                                                            )}
                                                            className="font-medium"
                                                        >
                                                            {getUrgencyLabel(
                                                                recommendation.category
                                                            )}
                                                        </Chip>
                                                        <span className="font-semibold text-gray-800 text-base">
                                                            {
                                                                recommendation.title
                                                            }
                                                        </span>
                                                    </div>
                                                }
                                                className={`bg-gradient-to-r ${getCategoryGradient(recommendation.category)} shadow-sm hover:shadow-md transition-all duration-200 rounded-lg`}
                                            >
                                                <div className="space-y-3 px-1 py-2">
                                                    {recommendation.items.map(
                                                        (item, itemIndex) => (
                                                            <div
                                                                key={`item-${index}-${itemIndex}`}
                                                                className="flex items-start gap-3"
                                                            >
                                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                                                <div className="text-sm text-gray-700 leading-relaxed font-medium">
                                                                    {item.startsWith(
                                                                        '•'
                                                                    ) ? (
                                                                        <span>
                                                                            {item
                                                                                .substring(
                                                                                    1
                                                                                )
                                                                                .trim()}
                                                                        </span>
                                                                    ) : item.endsWith(
                                                                          ':'
                                                                      ) ? (
                                                                        <strong className="text-gray-800">
                                                                            {
                                                                                item
                                                                            }
                                                                        </strong>
                                                                    ) : (
                                                                        <span>
                                                                            {
                                                                                item
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </AccordionItem>
                                        )
                                    )}
                                </Accordion>
                            </div>
                        ) : (
                            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                <CardBody className="p-6 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <Sparkles className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-blue-800">
                                            No Recommendations Available
                                        </h3>
                                        <p className="text-blue-600 text-sm">
                                            Complete your health assessment to
                                            receive personalized
                                            recommendations.
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {/* Urgent Notice */}
                        {recommendations.some((r) => r.category === 'red') && (
                            <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 shadow-sm">
                                <CardBody className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-red-800 mb-2 text-base">
                                                ⚠️ Important Health Notice
                                            </h4>
                                            <p className="text-sm text-red-700 leading-relaxed font-medium">
                                                You have{' '}
                                                <strong>{urgentCount}</strong>{' '}
                                                urgent recommendation
                                                {urgentCount > 1
                                                    ? 's'
                                                    : ''}{' '}
                                                that require immediate
                                                attention. Please prioritize
                                                these actions and consider
                                                seeking appropriate professional
                                                support when needed.
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {/* Mental Health Hotlines */}
                        <Accordion
                            variant="splitted"
                            selectionMode="multiple"
                            className="space-y-2 mt-2"
                            defaultExpandedKeys={[`hotlines`]}
                        >
                            <AccordionItem
                                key="hotlines"
                                aria-label="Mental Health Hotlines"
                                title={
                                    <div className="flex items-center gap-3 py-1">
                                        <Heart className="w-5 h-5 text-blue-600" />
                                        <span className="font-bold text-blue-800 text-base">
                                            🧠 Mental Health Hotlines
                                        </span>
                                    </div>
                                }
                                className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 shadow-sm rounded-lg"
                            >
                                <ul className="text-sm text-blue-700 leading-relaxed font-medium space-y-2">
                                    <li>
                                        <span className="font-semibold">
                                            NMCH Crisis Hotline:
                                        </span>
                                        <ul className="list-disc ml-8 mt-1 space-y-1">
                                            <li>1553</li>
                                            <li>1800-1888-1553</li>
                                            <li>0919-057-1553</li>
                                            <li>0917-899-8727</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <span className="font-semibold">
                                            In Touch Crisis Line:
                                        </span>
                                        <ul className="list-disc ml-8 mt-1 space-y-1">
                                            <li>+63-2-8893-7603</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <span className="font-semibold">
                                            HOPELINE:
                                        </span>
                                        <ul className="list-disc ml-8 mt-1 space-y-1">
                                            <li>(02) 8804-4673</li>
                                            <li>0917-558-4673</li>
                                        </ul>
                                    </li>
                                </ul>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </ModalBody>

                <ModalFooter className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-xs text-gray-500">
                            💡 Save or screenshot these recommendations for
                            future reference
                        </p>
                        <Button
                            color="success"
                            onPress={onClose}
                            className="px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            size="lg"
                        >
                            Got it, thanks!
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RecommendationsModal;
