import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from '@heroui/react';

interface ConfirmModalProps {
    modalType: 'success' | 'error';
    setShowModal: (value: boolean) => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    modalType,
    setShowModal,
}) => {
    return (
        <Modal isOpen onClose={() => setShowModal(false)} backdrop="opaque">
            <ModalContent>
                <ModalHeader className="text-lg font-semibold">
                    {modalType === 'success'
                        ? 'Form submitted!'
                        : 'Submission failed'}
                </ModalHeader>
                <ModalBody>
                    {modalType === 'success'
                        ? 'Your form was successfully submitted.'
                        : 'There was an error submitting your form. Please try again.'}
                </ModalBody>
                <ModalFooter>
                    <Button
                        className="bg-primary text-white"
                        onPress={() => setShowModal(false)}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ConfirmModal;
