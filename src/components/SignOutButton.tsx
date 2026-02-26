import { AuthButtonProps } from '@/types';
import { Button } from '@heroui/react';

const SignOutButton: React.FC<AuthButtonProps> = ({ onPress }) => {
    return (
        <Button
            onPress={onPress}
            variant="flat"
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            size="md"
        >
            Log Out
        </Button>
    );
};

export default SignOutButton;
