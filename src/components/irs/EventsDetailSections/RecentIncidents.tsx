import { Card, CardBody, CardHeader, Chip, Skeleton } from '@heroui/react';
import { Calendar, Clock, MapPin, Target, Users } from 'lucide-react';
import { colorTypes, Incident } from '@/types';

const RecentIncidents: React.FC<{
    teamIncidents: Incident[];
    loading?: boolean;
}> = ({ teamIncidents, loading = false }) => {
    // TODO: ticket# 000000 - Consider putting this into a global utility fxn.
    const formatDate = (date: string | Date) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getSeverityChipColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'danger';
            case 'high':
                return 'warning';
            case 'medium':
                return 'primary';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                        Recent Incidents
                    </h2>
                </div>
            </CardHeader>
            <CardBody>
                <div className="space-y-4">
                    {loading
                        ? Array.from({ length: 5 }).map((_, index) => (
                              <Card key={index} className="border">
                                  <CardBody>
                                      <div className="flex justify-between items-start mb-3">
                                          <div className="flex-1">
                                              <Skeleton className="w-48 h-6 rounded-lg mb-2">
                                                  <div className="h-6"></div>
                                              </Skeleton>
                                              <Skeleton className="w-full h-4 rounded-lg mb-2">
                                                  <div className="h-4"></div>
                                              </Skeleton>
                                          </div>
                                          <Skeleton className="w-16 h-6 rounded-full">
                                              <div className="h-6"></div>
                                          </Skeleton>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          {Array.from({ length: 4 }).map(
                                              (_, i) => (
                                                  <div
                                                      key={i}
                                                      className="flex items-center gap-1"
                                                  >
                                                      <Skeleton className="w-3 h-3 rounded">
                                                          <div className="h-3"></div>
                                                      </Skeleton>
                                                      <Skeleton className="w-20 h-3 rounded">
                                                          <div className="h-3"></div>
                                                      </Skeleton>
                                                  </div>
                                              )
                                          )}
                                      </div>
                                  </CardBody>
                              </Card>
                          ))
                        : teamIncidents
                              .sort(
                                  (a, b) =>
                                      new Date(b.createdAt).getTime() -
                                      new Date(a.createdAt).getTime()
                              )
                              .slice(0, 10)
                              .map((incident) => (
                                  <Card key={incident.id} className="border">
                                      <CardBody>
                                          <div className="flex justify-between items-start mb-3">
                                              <div className="flex-1">
                                                  <h3 className="font-semibold text-gray-900 mb-1">
                                                      {incident.summary}
                                                  </h3>
                                                  <p className="text-sm text-gray-600 mb-2">
                                                      {incident.description}
                                                  </p>
                                              </div>
                                              <Chip
                                                  size="sm"
                                                  color={
                                                      getSeverityChipColor(
                                                          incident.severity
                                                      ) as colorTypes
                                                  }
                                                  variant="flat"
                                              >
                                                  {incident.severity}
                                              </Chip>
                                          </div>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                              <div className="flex items-center gap-1">
                                                  <MapPin className="w-3 h-3" />
                                                  <span>
                                                      {incident.location}
                                                  </span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                  <Calendar className="w-3 h-3" />
                                                  <span>
                                                      {formatDate(
                                                          incident.date
                                                      )}
                                                  </span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                  <Target className="w-3 h-3" />
                                                  <span>
                                                      {incident.category}
                                                  </span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                  <Users className="w-3 h-3" />
                                                  <span>
                                                      {incident.reporter ||
                                                          'Unknown'}
                                                  </span>
                                              </div>
                                          </div>
                                      </CardBody>
                                  </Card>
                              ))}
                </div>
            </CardBody>
        </Card>
    );
};

export default RecentIncidents;
