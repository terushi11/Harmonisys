import {
    Button,
    Card,
    CardBody,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react';

const MHPSSLevel = ({
    isOpen,
    onOpenChange,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
            scrollBehavior="inside"
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
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg">
                                    <svg
                                        className="w-6 h-6 text-white"
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
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                        MHPSS Level Legend
                                    </h3>
                                    <p className="text-slate-600 font-medium">
                                        Mental Health and Psychosocial Support
                                        Levels
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Card className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-green-100/50">
                                    <CardBody className="p-4">
                                        <h4 className="font-bold text-green-800 text-lg mb-2">
                                            Level 1 - Basic Psychosocial Support
                                        </h4>
                                        <p className="text-green-700">
                                            Basic services and security,
                                            community and family supports
                                        </p>
                                    </CardBody>
                                </Card>

                                <Card className="border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100/50">
                                    <CardBody className="p-4">
                                        <h4 className="font-bold text-yellow-800 text-lg mb-2">
                                            Level 2 - Focused Psychosocial
                                            Support
                                        </h4>
                                        <p className="text-yellow-700">
                                            Focused, non-specialized supports
                                            for individuals and families
                                        </p>
                                    </CardBody>
                                </Card>

                                <Card className="border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100/50">
                                    <CardBody className="p-4">
                                        <h4 className="font-bold text-orange-800 text-lg mb-2">
                                            Level 3 - Psychological Support
                                        </h4>
                                        <p className="text-orange-700">
                                            Focused individual, family or group
                                            interventions by trained and
                                            supervised workers
                                        </p>
                                    </CardBody>
                                </Card>

                                <Card className="border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50">
                                    <CardBody className="p-4">
                                        <h4 className="font-bold text-red-800 text-lg mb-2">
                                            Level 4 - Specialized Mental Health
                                            Care
                                        </h4>
                                        <p className="text-red-700">
                                            Specialized services for the
                                            management of severe mental health
                                            conditions
                                        </p>
                                    </CardBody>
                                </Card>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                onPress={onClose}
                                className="font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default MHPSSLevel;
