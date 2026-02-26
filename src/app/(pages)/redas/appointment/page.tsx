'use client';

import { REDAS_THEME } from '@/constants/Redas';
import { Button } from '@heroui/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const AppointmentPage = () => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    const handleBooking = () => {
        if (!selectedDate) return;
        alert(`Training requested for ${selectedDate.toLocaleDateString()}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-tertiary flex items-center justify-center px-4 py-12">
            <div className="flex flex-col">
                <div className="mb-6">
                    <Button
                        as={Link}
                        href="/overview/redas"
                        variant="light"
                        startContent={<ArrowLeft className="w-4 h-4" />}
                        className={`bg-white/70 backdrop-blur-sm border ${REDAS_THEME.accentColor} hover:bg-gradient-to-r hover:${REDAS_THEME.primaryGradient} hover:text-white transition-all duration-300 font-medium shadow-sm hover:shadow-md`}
                    >
                        Go Back
                    </Button>
                </div>
                <div className="bg-white border-2 border-primary shadow-2xl rounded-2xl p-10 w-full max-w-xl text-center">
                    <h1 className="text-3xl font-extrabold text-secondary mb-3">
                        Request a REDAS Training
                    </h1>
                    <p className="text-textColor mb-6">
                        Select your preferred training date from the calendar
                        below. Click &quot;Book Appointment&quot; to confirm
                        your request.
                    </p>

                    <div className="mb-6 rdp-custom text-secondary">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            modifiersClassNames={{
                                selected: 'bg-primary text-white',
                                today: 'border border-primary',
                            }}
                            className="mx-auto"
                        />
                    </div>

                    <button
                        onClick={handleBooking}
                        disabled={!selectedDate}
                        className="w-full bg-primary text-white px-6 py-3 font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 hover:bg-[#5abfe0]"
                    >
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentPage;
