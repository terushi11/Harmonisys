'use client';

import { useState, useTransition } from 'react';
import { Button, Select, SelectItem, Checkbox } from '@heroui/react';
import { Mail, Lock, User, Users, MapPin, Briefcase, HeartPulse } from 'lucide-react';
import AuthFloatingInput from './AuthFloatingInput';
import Link from "next/link";

const TERMS_AND_PRIVACY_URL =
  process.env.NEXT_PUBLIC_TERMS_AND_PRIVACY_URL || '/';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

const genderOptions = [
  { key: 'MALE', label: 'Male' },
  { key: 'FEMALE', label: 'Female' },
];

const roleOptions = [
  { key: 'STANDARD', label: 'Standard User' },
  { key: 'RESPONDER', label: 'Responder' },
  { key: 'ADMIN', label: 'Admin' },
];

const mhpssLevelOptions = [
  { key: 'LEVEL_1', label: 'Level 1 - Basic Psychosocial Support' },
  { key: 'LEVEL_2', label: 'Level 2 - Focused Psychosocial Support' },
  { key: 'LEVEL_3', label: 'Level 3 - Psychological Support' },
  { key: 'LEVEL_4', label: 'Level 4 - Specialized Mental Health Care' },
];

const regionOptions = [
  { key: 'NCR', label: 'National Capital Region (NCR)' },
  { key: 'CAR', label: 'Cordillera Administrative Region (CAR)' },
  { key: 'Region I', label: 'Region I - Ilocos Region' },
  { key: 'Region II', label: 'Region II - Cagayan Valley' },
  { key: 'Region III', label: 'Region III - Central Luzon' },
  { key: 'Region IV-A', label: 'Region IV-A - CALABARZON' },
  { key: 'Region IV-B', label: 'Region IV-B - MIMAROPA' },
  { key: 'Region V', label: 'Region V - Bicol Region' },
  { key: 'Region VI', label: 'Region VI - Western Visayas' },
  { key: 'Region VII', label: 'Region VII - Central Visayas' },
  { key: 'Region VIII', label: 'Region VIII - Eastern Visayas' },
  { key: 'Region IX', label: 'Region IX - Zamboanga Peninsula' },
  { key: 'Region X', label: 'Region X - Northern Mindanao' },
  { key: 'Region XI', label: 'Region XI - Davao Region' },
  { key: 'Region XII', label: 'Region XII - SOCCSKSARGEN' },
  { key: 'Region XIII', label: 'Region XIII - Caraga' },
  { key: 'BARMM', label: 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)' },
];

const selectClassNames = {
  base: 'w-full',
  label: 'hidden',
  trigger:
    'h-16 min-h-16 rounded-[22px] border border-white/25 bg-white/10 px-4 !text-white shadow-none transition-all duration-200 hover:border-white/35 data-[focus=true]:border-white/50 data-[open=true]:border-white/50',
  mainWrapper: 'text-white',
  innerWrapper: '!text-white',
  value: '!text-white text-[1.05rem] font-medium',
  selectorIcon: '!text-white/80',
  listboxWrapper: 'max-h-64',
  popoverContent:
    'bg-[rgb(104,10,20)] text-white border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] rounded-2xl',
  listbox: 'bg-[rgb(104,10,20)] text-white p-2 rounded-2xl',
};

const itemClassNames = {
  base: 'rounded-xl text-white data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10',
  title: 'text-white text-[1rem]',
  selectedIcon: 'text-white',
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [region, setRegion] = useState('');
  const [mhpssLevel, setMhpssLevel] = useState('');
  const [role, setRole] = useState('');
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            gender,
            region,
            mhpssLevel,
            role,
            privacyPolicyAccepted,
            email,
            password,
            confirmPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data?.success) {
          setErrorMessage(data?.message || 'Registration failed.');
          return;
        }

        setSuccessMessage('Registration successful. You can now log in.');
        setFirstName('');
        setLastName('');
        setGender('');
        setRegion('');
        setMhpssLevel('');
        setRole('');
        setPrivacyPolicyAccepted(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        onSuccess?.();
      } catch {
        setErrorMessage('Something went wrong during registration.');
      }
    });
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">
        <AuthFloatingInput
          type="text"
          label="Enter first name"
          value={firstName}
          onChange={setFirstName}
          icon={<User className="w-5 h-5" />}
          required
          autoComplete="off"
        />

        <AuthFloatingInput
          type="text"
          label="Enter last name"
          value={lastName}
          onChange={setLastName}
          icon={<User className="w-5 h-5" />}
          required
          autoComplete="off"
        />

          <div className="space-y-4">
            <Select
              placeholder="Gender"
              startContent={!gender ? <Users className="w-5 h-5 text-white/80" /> : null}
              selectedKeys={gender ? [gender] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                setGender(String(value || ''));
              }}
              variant="bordered"
              classNames={selectClassNames}
              disallowEmptySelection={false}
              renderValue={(items) => (
                <span className="text-[1.05rem] font-medium text-white">
                  {items[0]?.textValue}
                </span>
              )}
            >
              {genderOptions.map((item) => (
                <SelectItem key={item.key} classNames={itemClassNames}>
                  {item.label}
                </SelectItem>
              ))}
            </Select>

                <Select
                  placeholder="Region"
                  startContent={!region ? <MapPin className="w-5 h-5 text-white/80" /> : null}
                  selectedKeys={region ? [region] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setRegion(String(value || ''));
                  }}
                  variant="bordered"
                  classNames={selectClassNames}
                  disallowEmptySelection={false}
                  renderValue={(items) => (
                    <span className="text-[1.05rem] font-medium text-white">
                      {items[0]?.textValue}
                    </span>
                  )}
                >
              {regionOptions.map((item) => (
                <SelectItem key={item.key} classNames={itemClassNames}>
                  {item.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Role"
              startContent={!role ? <Briefcase className="w-5 h-5 text-white/80" /> : null}
              selectedKeys={role ? [role] : []}
              onSelectionChange={(keys) => {
                const value = String(Array.from(keys)[0] || '');
                setRole(value);

                if (value !== 'RESPONDER') {
                  setMhpssLevel('');
                }
              }}
              variant="bordered"
              classNames={selectClassNames}
              disallowEmptySelection={false}
              renderValue={(items) => (
                <span className="text-[1.05rem] font-medium text-white">
                  {items[0]?.textValue}
                </span>
              )}
            >
              {roleOptions.map((item) => (
                <SelectItem key={item.key} classNames={itemClassNames}>
                  {item.label}
                </SelectItem>
              ))}
            </Select>

            {role === 'RESPONDER' && (
              <Select
                placeholder="MHPSS Level"
                startContent={
                  !mhpssLevel ? <HeartPulse className="w-5 h-5 text-white/80" /> : null
                }
                selectedKeys={mhpssLevel ? [mhpssLevel] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0];
                  setMhpssLevel(String(value || ''));
                }}
                variant="bordered"
                classNames={selectClassNames}
                disallowEmptySelection={false}
                renderValue={(items) => (
                  <span className="text-[1.05rem] font-medium text-white">
                    {items[0]?.textValue}
                  </span>
                )}
              >
                {mhpssLevelOptions.map((item) => (
                  <SelectItem key={item.key} classNames={itemClassNames}>
                    {item.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          </div>

          <div className="flex justify-end">
            <Checkbox
              color="warning"
              isSelected={privacyPolicyAccepted}
              onValueChange={setPrivacyPolicyAccepted}
              classNames={{
                base: "pt-1",
                label: "text-white/90 text-sm flex items-center gap-1",
              }}
            >
              I agree to the{" "}
              <Link
                href={TERMS_AND_PRIVACY_URL}
                className="text-yellow-300 hover:text-yellow-200 underline underline-offset-4"
              >
                Privacy Policy
              </Link>
            </Checkbox>
          </div>

        <AuthFloatingInput
          type="email"
          label="Enter email"
          value={email}
          onChange={setEmail}
          icon={<Mail className="w-5 h-5" />}
          required
          autoComplete="off"
        />

        <AuthFloatingInput
          type="password"
          label="Enter password"
          value={password}
          onChange={setPassword}
          icon={<Lock className="w-5 h-5" />}
          required
          autoComplete="new-password"
        />

        <AuthFloatingInput
          type="password"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          icon={<Lock className="w-5 h-5" />}
          required
          autoComplete="new-password"
        />

        {errorMessage && (
          <div className="rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {successMessage}
          </div>
        )}

        <Button
          type="submit"
          isLoading={isPending}
          className="w-full h-14 rounded-2xl bg-yellow-400 text-black font-bold text-[18px] hover:bg-yellow-300"
        >
          Register
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-white/80">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-white underline underline-offset-4 hover:text-yellow-200"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;