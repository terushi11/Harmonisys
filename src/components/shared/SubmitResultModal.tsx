'use client';

import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from '@heroui/react';
import { CheckCircle, XCircle } from 'lucide-react';

type SubmitResultModalProps = {
    isOpen: boolean;
    onOpenChange: (open?: boolean) => void;
    success: boolean;
    message?: string;
};

const SubmitResultModal: React.FC<SubmitResultModalProps> = ({
    isOpen,
    onOpenChange,
    success,
    message,
}) => {
    const iconBg = success
        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
        : 'bg-gradient-to-r from-red-600 to-rose-500';

    const title = success ? 'Success' : 'Failed';
    const defaultMessage = success
        ? 'Your message was sent successfully. We will get back to you shortly.'
        : 'Something went wrong while sending your message. Please try again later.';

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => onOpenChange(Boolean(open))}
            isDismissable={true}
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
                        <ModalHeader className="flex items-center gap-3">
                            <div
                                className={`${iconBg} p-2 rounded-lg shadow-lg`}
                            >
                                {success ? (
                                    <CheckCircle className="w-5 h-5 text-white" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <h2
                                    className={`text-2xl font-bold ${
                                        success
                                            ? 'text-emerald-800'
                                            : 'text-rose-800'
                                    }`}
                                >
                                    {title}
                                </h2>
                                <p className="text-slate-600 text-sm font-medium">
                                    {success
                                        ? 'Message sent'
                                        : 'Message failed'}
                                </p>
                            </div>
                        </ModalHeader>

                        <ModalBody>
                            <p className="text-slate-700">
                                {message ?? defaultMessage}
                            </p>
                        </ModalBody>

                        <ModalFooter className="gap-3">
                            <Button
                                variant="light"
                                onPress={() => {
                                    onClose?.();
                                    onOpenChange(false);
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                onPress={() => {
                                    onClose?.();
                                    onOpenChange(false);
                                }}
                                className={`${
                                    success
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                                        : 'bg-gradient-to-r from-red-600 to-rose-500 text-white'
                                }`}
                            >
                                OK
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default SubmitResultModal;
