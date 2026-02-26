import type { UnahonGuideProps } from '@/types';
import Image from 'next/image';
import { Card, CardBody, CardHeader } from '@heroui/react';

const UnahonGuide = ({ page }: UnahonGuideProps) => {
    const guidelines = [
        {
            items: 'Items 1 & 2',
            description:
                'Closely monitor the IDP and conduct re-assessment right after completing appropriate intervention/s',
        },
        {
            items: 'Items 3, 4, & 5',
            description:
                'Closely monitor the IDP and conduct re-assessment depending on the severity of the self-injury or suicide attempt.',
        },
        {
            items: 'Items 6',
            description:
                'Conduct re-assessment two weeks to one month after completing appropriate interventions (if the IDP has no suicidal ideation).',
        },
        {
            items: 'Items 7 & 8',
            description:
                'Conduct re-assessment depending on the discretion of the medical doctor and/or the MHPSS specialist in the camp, unless the IDP has been brought to the nearest available hospital for further services.',
        },
        {
            items: 'Items 9',
            description:
                'Conduct re-assessment depending on the content of the hallucination. For example, if hallucination might lead to danger (i.e.: self-harm and violent behavior towards others), maintain constant supervision and conduct frequent re-assessment',
        },
        {
            items: 'Items 10',
            description:
                'Conduct re-assessment based on the threat and/or danger posed by the cause of disorientation',
        },
        {
            items: 'Items 11',
            description:
                'Conduct re-assessment three to four days after completing appropriate interventions.',
        },
    ];

    const renderContent = () => {
        switch (page) {
            case 1:
                return (
                    <div className="space-y-8">
                        <Card className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 shadow-lg">
                            <CardHeader>
                                <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                                    Summary for Conducting Re-assessment for
                                    Items under{' '}
                                    <span className="text-red-600 font-extrabold bg-red-100 px-2 py-1 rounded">
                                        RED
                                    </span>
                                </h2>
                            </CardHeader>
                            <CardBody>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {guidelines.map((guideline, index) => (
                                        <Card
                                            key={index}
                                            className="bg-white/70 backdrop-blur-sm shadow-md border border-red-200 hover:shadow-lg transition-all duration-300"
                                        >
                                            <CardBody className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm px-3 py-2 rounded-lg shadow-md">
                                                        {guideline.items}
                                                    </div>
                                                    <p className="italic text-slate-700 leading-relaxed flex-1">
                                                        {guideline.description}
                                                    </p>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-300 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4 text-center">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src="/red_x.png"
                                                alt="Stop Warning"
                                                width={80}
                                                height={80}
                                                className="object-contain drop-shadow-lg"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-red-600 text-lg lg:text-xl font-bold leading-relaxed">
                                                <span className="bg-red-100 px-2 py-1 rounded font-extrabold">
                                                    HUMINTO
                                                </span>{' '}
                                                kung mayroon nang{' '}
                                                <span className="bg-red-100 px-2 py-1 rounded font-bold">
                                                    OO
                                                </span>{' '}
                                                sa mga naunang tanong at{' '}
                                                <span className="bg-red-100 px-2 py-1 rounded font-bold">
                                                    gawin ang mga interbensyon
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card className="bg-gradient-to-r from-green-50 to-green-100/50 border border-green-300 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4 text-center">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src="/checkmark.png"
                                                alt="Success Checkmark"
                                                width={80}
                                                height={80}
                                                className="object-contain drop-shadow-lg"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-green-600 text-lg lg:text-xl font-bold leading-relaxed">
                                                <span className="bg-green-100 px-2 py-1 rounded font-extrabold">
                                                    Ulitin ang checklist
                                                </span>{' '}
                                                ayon sa rekomendasyon ng
                                                specialist (tignan ang page 2 ng
                                                tool at ng page _ sa User&apos;s
                                                manual para sa karagdagang
                                                impormasyon).
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-300 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4 text-center">
                                    <div className="flex-shrink-0">
                                        <Image
                                            src="/red_x.png"
                                            alt="Stop Warning"
                                            width={80}
                                            height={80}
                                            className="object-contain drop-shadow-lg"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-red-600 text-lg lg:text-xl font-bold leading-relaxed">
                                            <span className="bg-red-100 px-2 py-1 rounded font-extrabold">
                                                HUMINTO
                                            </span>{' '}
                                            kung mayroon nang{' '}
                                            <span className="bg-red-100 px-2 py-1 rounded font-bold">
                                                OO
                                            </span>{' '}
                                            sa mga naunang tanong at{' '}
                                            <span className="bg-red-100 px-2 py-1 rounded font-bold">
                                                gawin ang mga interbensyon
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-r from-green-50 to-green-100/50 border border-green-300 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <Image
                                            src="/checkmark.png"
                                            alt="Success Checkmark"
                                            width={80}
                                            height={80}
                                            className="object-contain drop-shadow-lg"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <p className="text-green-600 text-lg lg:text-xl font-bold">
                                            <span className="bg-green-100 px-2 py-1 rounded font-extrabold">
                                                Ulitin ang checklist
                                            </span>{' '}
                                            pagkatapos gawin ang mga
                                            intervention at tignan kung
                                            epektibo.
                                        </p>

                                        <Card className="bg-red-50 border border-red-200">
                                            <CardBody className="p-3">
                                                <p className="text-slate-700 text-sm">
                                                    <span className="font-semibold">
                                                        Hindi gumana:
                                                    </span>{' '}
                                                    <span className="text-red-600 font-bold">
                                                        Dalhin kaagad sa MHPSS
                                                        specialist
                                                    </span>{' '}
                                                    <span className="text-red-600">
                                                        ang IDP kung nagawa na
                                                        ang lahat ng
                                                        intervention at hindi pa
                                                        rin maituturing na berde
                                                        ang kalagayan ng IDP.
                                                    </span>
                                                </p>
                                            </CardBody>
                                        </Card>

                                        <Card className="bg-green-50 border border-green-200">
                                            <CardBody className="p-3">
                                                <p className="text-slate-700 text-sm">
                                                    <span className="font-semibold">
                                                        Gumana:
                                                    </span>{' '}
                                                    <span className="text-green-600 font-bold">
                                                        Tumuloy sa berde.
                                                    </span>
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                );
            case 3:
                return (
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
                        <CardHeader>
                            <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                                Additional Guidelines & References
                            </h2>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <Card className="bg-white/70 backdrop-blur-sm shadow-md border border-blue-200">
                                <CardBody className="p-4">
                                    <p className="text-slate-700 leading-relaxed">
                                        <span className="font-extrabold text-blue-600">
                                            *
                                        </span>
                                        Sumangguni sa Competency Table ng DOH,
                                        DSWD, DepEd Harmonized MHPSS Training
                                        Manual pp. 3-4. (
                                        <span className="italic">
                                            Refer to the Competency Table of the
                                            DOH, DSWD, DepEd Harmonized MHPSS
                                            Training Manual, pp. 3-4
                                        </span>
                                        )
                                    </p>
                                </CardBody>
                            </Card>

                            <Card className="bg-white/70 backdrop-blur-sm shadow-md border border-blue-200">
                                <CardBody className="p-4">
                                    <p className="text-slate-700 leading-relaxed">
                                        <sup className="font-extrabold text-blue-600 bg-blue-100 px-1 rounded">
                                            1
                                        </sup>{' '}
                                        Siguruhing hindi kasama ang IDP sa kahit
                                        na anong kilos na nasa ilalim ng pulang
                                        kategorya. (
                                        <span className="italic">
                                            Ensure that the IDP does not fall in
                                            any of the behaviors under red.
                                        </span>
                                        )
                                    </p>
                                </CardBody>
                            </Card>

                            <Card className="bg-white/70 backdrop-blur-sm shadow-md border border-blue-200">
                                <CardBody className="p-4">
                                    <p className="text-slate-700 leading-relaxed">
                                        <sup className="font-extrabold text-blue-600 bg-blue-100 px-1 rounded">
                                            2
                                        </sup>{' '}
                                        Kung ang IDP ay nasa ilalim ng berdeng
                                        kategorya, hindi nangangahulugan na wala
                                        siyang sintomas. Kailangan ang PFA para
                                        makita kung ano pa ang mga nararapat
                                        gawin. (
                                        <span className="italic">
                                            If the IDP is triaged under green,
                                            it does not mean that he or she is
                                            symptom-free. PFA is still needed to
                                            assess needs.
                                        </span>
                                        )
                                    </p>
                                </CardBody>
                            </Card>
                        </CardBody>
                    </Card>
                );
            default:
                return <div></div>;
        }
    };

    return <div>{renderContent()}</div>;
};

export default UnahonGuide;
