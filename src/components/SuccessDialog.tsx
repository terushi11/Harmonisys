'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { CheckCircle, X } from 'lucide-react';

type Props = {
    open: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    buttonText?: string;
    variant?: 'success' | 'info' | 'warning';
};

const SuccessDialog = ({
    open,
    onClose,
    title = 'Success!',
    message = 'Form submitted successfully!',
    buttonText = 'OK',
    variant = 'success',
}: Props) => {
    if (!open) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    iconBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
                    iconColor: 'text-white',
                    titleColor:
                        'bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent',
                    buttonColor: 'success' as const,
                };
            case 'info':
                return {
                    iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                    iconColor: 'text-white',
                    titleColor:
                        'bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent',
                    buttonColor: 'primary' as const,
                };
            case 'warning':
                return {
                    iconBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
                    iconColor: 'text-white',
                    titleColor:
                        'bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent',
                    buttonColor: 'warning' as const,
                };
            default:
                return {
                    iconBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
                    iconColor: 'text-white',
                    titleColor:
                        'bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent',
                    buttonColor: 'success' as const,
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300 ease-out scale-100">
                <CardBody className="p-8 text-center">
                    {/* Close Button */}
                    <div className="absolute top-4 right-4">
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={onClose}
                            className="hover:bg-gray-100 transition-colors duration-200"
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </Button>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div
                            className={`p-4 rounded-full ${styles.iconBg} shadow-lg`}
                        >
                            <CheckCircle
                                className={`w-8 h-8 ${styles.iconColor}`}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <h2
                        className={`text-2xl font-bold mb-4 ${styles.titleColor}`}
                    >
                        {title}
                    </h2>

                    {/* Message */}
                    <p className="text-gray-600 text-base leading-relaxed mb-8 font-medium">
                        {message}
                    </p>

                    {/* Action Button */}
                    <Button
                        color={styles.buttonColor}
                        onPress={onClose}
                        className="font-bold min-w-[120px] h-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        size="lg"
                    >
                        {buttonText}
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
};

export default SuccessDialog;
