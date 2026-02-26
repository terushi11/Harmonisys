import Header from '@/components/Header';
import { auth } from '@/lib/auth';
import UserTable from '@/components/users/UserTable';
import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { Shield, UserIcon } from 'lucide-react';
import { UserType } from '@prisma/client';

const UserPage = async () => {
    const session = await auth();

    return (
        <div>
            <Header session={session} />
            {session?.user.role === UserType.ADMIN ? (
                <UserTable />
            ) : (
                <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto">
                        <Card className="max-w-md">
                            <CardHeader className="flex flex-col items-center pb-0 pt-8">
                                <div className="flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full mb-4">
                                    <Shield className="w-8 h-8 text-danger-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    Access Restricted
                                </h2>
                                <Chip color="danger" variant="flat" size="sm">
                                    Admin Access Required
                                </Chip>
                            </CardHeader>

                            <CardBody className="px-6 py-6">
                                <p className="text-default-600 text-center mb-6">
                                    You cannot access the user management
                                    section as you do not have administrator
                                    privileges.
                                </p>

                                <Card className="bg-danger-50 border-danger-200">
                                    <CardBody className="p-4">
                                        <div className="flex items-start">
                                            <UserIcon className="w-5 h-5 text-danger-600 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <h3 className="text-sm font-medium text-danger-800 mb-1">
                                                    Administrator Access Only
                                                </h3>
                                                <p className="text-sm text-danger-700">
                                                    This section is restricted
                                                    to users with administrator
                                                    privileges. Please contact
                                                    an administrator if you
                                                    believe you should have
                                                    access.
                                                </p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPage;
