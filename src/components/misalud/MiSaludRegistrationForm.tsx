'use client';

import { useEffect, useState } from 'react';
import {
    Input,
    Button,
    Select,
    SelectItem,
} from '@heroui/react';

type TeamOption = {
    id: string;
    name: string;
};

type Props = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

const roleOptions = [
    { key: 'TEAM_LEADER', label: 'Team Leader' },
    { key: 'TEAM_MEMBER', label: 'Team Member' },
];

const MiSaludRegistrationForm = ({ onSuccess, onCancel }: Props) => {
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [address, setAddress] = useState('');
    const [requestedRole, setRequestedRole] = useState<
        'TEAM_LEADER' | 'TEAM_MEMBER' | ''
    >('');
    const [teamName, setTeamName] = useState('');
    const [teamId, setTeamId] = useState('');
    const [approvedTeams, setApprovedTeams] = useState<TeamOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchApprovedTeams = async () => {
            try {
                const res = await fetch('/api/misalud/teams/approved');
                if (!res.ok) return;

                const data = await res.json();
                setApprovedTeams(data.teams || []);
            } catch (error) {
                console.error('Error fetching approved teams:', error);
            }
        };

        fetchApprovedTeams();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const payload = {
                fullName,
                age: Number(age),
                address,
                requestedRole,
                teamName: requestedRole === 'TEAM_LEADER' ? teamName : undefined,
                teamId: requestedRole === 'TEAM_MEMBER' ? teamId : undefined,
            };

            const res = await fetch('/api/misalud/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit registration');
            }

            setSuccessMessage(data.message || 'Registration submitted successfully.');

            setTimeout(() => {
                onSuccess?.();
            }, 1200);
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Something went wrong.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                isRequired
                variant="bordered"
            />

            <Input
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                isRequired
                variant="bordered"
                min={1}
            />

            <Input
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                isRequired
                variant="bordered"
            />

            <Select
                label="Position"
                selectedKeys={requestedRole ? [requestedRole] : []}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as
                        | 'TEAM_LEADER'
                        | 'TEAM_MEMBER'
                        | undefined;

                    setRequestedRole(value || '');
                    setTeamName('');
                    setTeamId('');
                }}
                isRequired
                variant="bordered"
            >
                {roleOptions.map((role) => (
                    <SelectItem key={role.key}>
                        {role.label}
                    </SelectItem>
                ))}
            </Select>

            {requestedRole === 'TEAM_LEADER' && (
                <Input
                    label="Team/Department Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    isRequired
                    variant="bordered"
                    placeholder="Enter your new team or department name"
                />
            )}

            {requestedRole === 'TEAM_MEMBER' && (
                <Select
                    label="Team/Department"
                    selectedKeys={teamId ? [teamId] : []}
                    onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string | undefined;
                        setTeamId(value || '');
                    }}
                    isRequired
                    variant="bordered"
                >
                    {approvedTeams.map((team) => (
                        <SelectItem key={team.id}>
                            {team.name}
                        </SelectItem>
                    ))}
                </Select>
            )}

            {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            {successMessage && (
                <p className="text-sm text-emerald-600 font-medium">
                    {successMessage}
                </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="light"
                    onPress={onCancel}
                    isDisabled={isSubmitting}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    color="success"
                    isLoading={isSubmitting}
                >
                    Submit Registration
                </Button>
            </div>
        </form>
    );
};

export default MiSaludRegistrationForm;