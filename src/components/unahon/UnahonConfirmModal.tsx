import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from '@heroui/react';

interface UnahonConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const UnahonConfirmModal: React.FC<UnahonConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="opaque">
        <ModalContent>
            <ModalHeader>Confirm Submission</ModalHeader>
            <ModalBody>
                Are you sure you want to submit this assessment?
            </ModalBody>
            <ModalFooter>
                <Button variant="light" onPress={onClose}>
                    Cancel
                </Button>
                <Button color="primary" onPress={onConfirm}>
                    Submit
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
);

export default UnahonConfirmModal;
