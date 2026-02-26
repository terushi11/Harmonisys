import { Card, CardBody } from '@heroui/react';

const MarkerLegend = ({ isVisible }: { isVisible: boolean }) => {
    if (!isVisible) return null;

    const legendItems = [
        { color: '#ef4444', label: '40+', size: 'High Training' },
        { color: '#f97316', label: '30-39', size: 'Medium-High' },
        { color: '#eab308', label: '20-29', size: 'Medium' },
        { color: '#22c55e', label: '10-19', size: 'Low-Medium' },
        { color: '#3b82f6', label: '0-9', size: 'Low Training' },
    ];

    return (
        <div className="absolute top-4 left-4 z-[1000]">
            <Card className="shadow-lg">
                <CardBody className="px-4 py-3">
                    <h4 className="font-semibold mb-3 text-sm">
                        Training Count Legend
                    </h4>
                    <div className="space-y-2">
                        {legendItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: item.color }}
                                />
                                <div className="flex-1">
                                    <div className="text-xs font-medium">
                                        {item.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {item.size}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default MarkerLegend;
