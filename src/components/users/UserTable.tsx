'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Tooltip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Button,
  useDisclosure,
  Card,
  CardBody,
  Chip,
  Input,
} from '@heroui/react';
import useSWR from 'swr';
import type { User } from '@/types';

type PendingRoleRequest = {
  id: string;
  toRole: UserType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt?: string;
};

type UserWithPending = User & {
  pendingRoleRequest?: PendingRoleRequest | null;
};

import { updateUserCompetency, updateUserRole } from '@/lib/action/user';
import { UserType } from '@prisma/client';
import {
  Users,
  Shield,
  Award,
  UserIcon,
  Info,
  Edit3,
  Trash2,
  XCircle,
  UserCog,
  Search,
} from 'lucide-react';
import MHPSSLevel from '@/components/MHPSS';

const maroonTheme = {
  // ✅ no background image, just soft maroon gradient
  background: 'bg-gradient-to-br from-[#F9F3F5] via-[#F6E9EE] to-[#F3E2E7]',

  headerGradient: 'from-[#4A0707] via-[#6B0F0F] to-[#A11B1B]',

  // ✅ white elevated title (shadow)
  title: 'text-white drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]',
  subtitle: 'text-white/85',

  // elevated shell
  shell:
    'bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_20px_60px_rgba(42,6,13,0.22)]',
  innerPanel:
    'bg-white/70 border border-white/45 shadow-[0_10px_30px_rgba(42,6,13,0.10)]',

  // tabs
  tabWrap: 'bg-white/70 border border-white/45',
  tabActive:
  'bg-gradient-to-r from-[#4A0707] via-[#6B0F0F] to-[#A11B1B] text-white border-transparent shadow-md',
  tabIdle:
    'bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300',

  // ✅ gradient pills/cards on the right
  statPill:
    "bg-white/10 text-white border border-white/20 backdrop-blur-sm shadow-sm",
  legendBtn:
    "bg-white/15 text-white border border-white/25 backdrop-blur-sm shadow-sm hover:bg-white/20 transition-all",

  ghostBtn:
    'bg-white/85 text-[#7A0C1E] border border-[#7A0C1E]/20 hover:bg-[#B91C1C]/10 hover:border-[#B91C1C]/40 transition-all',
  
  filterBtn:
    'bg-white/85 text-[#7A0C1E] border-2 border-[#A11B1B]/30 hover:bg-[#A11B1B]/10 hover:border-[#A11B1B]/60 transition-all shadow-sm',
  dropdownMenu:
    'bg-white/95 backdrop-blur-sm border border-[#A11B1B]/15 shadow-[0_18px_50px_rgba(42,6,13,0.18)] rounded-2xl p-2',
  dropdownItem:
    'rounded-xl data-[hover=true]:bg-[#A11B1B]/10 data-[selectable=true]:focus:bg-[#A11B1B]/10',

  // table styling
  th: 'bg-gradient-to-r from-[#F3E2E7] to-[#F7EEF1] text-[#2A060D] font-extrabold border-b border-white/60',
  td: 'py-4 border-b border-white/60',
  rowHover: 'hover:bg-[#B91C1C]/[0.04] transition-colors duration-200',
  chipPill:
  "rounded-full px-3 py-1.5 border border-black/5 bg-white/80 backdrop-blur-sm",

  // action buttons
  actionBtnBase:
    'rounded-xl border border-slate-200 bg-white/85 shadow-sm hover:shadow-md transition-all duration-200',
  actionEdit:
    'text-[#B45309] hover:text-[#92400E] hover:bg-[#F59E0B]/10 hover:border-[#F59E0B]/25',
  actionDelete:
    'text-[#B91C1C] hover:text-[#7A0C1E] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/25',

  // pagination
  paginationWrap:
    'gap-1 overflow-visible h-10 rounded-xl border border-white/50 bg-white/80 backdrop-blur-sm shadow-lg',
  paginationItem:
    "w-10 h-10 text-sm rounded-lg bg-transparent hover:bg-[#A11B1B]/10 transition-all duration-200 font-medium text-slate-700 hover:text-[#A11B1B]",
  paginationCursor:
    'bg-gradient-to-r from-[#4A0707] via-[#6B0F0F] to-[#A11B1B] shadow-xl text-white font-bold rounded-lg border-2 border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300',
  paginationNav:
    'bg-white/90 hover:bg-[#B91C1C]/10 border border-white/50 text-[#7A0C1E] rounded-lg shadow-md hover:shadow-lg transition-all duration-200',
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const competencyOptions = [1, 2, 3, 4, null];
const roleOptions = [UserType.ADMIN, UserType.RESPONDER, UserType.STANDARD];

const UserTable = () => {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'USERS' | 'PENDING'>('USERS');
  // ✅ Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserType | 'ALL'>('ALL');
  const [mhpssFilter, setMhpssFilter] = useState<number | 'NONE' | 'ALL'>('ALL');

  type PendingRequestRow = {
    id: string;
    fromRole: UserType;
    toRole: UserType;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      role: UserType;
      competency: number | null;
      createdAt: string;
    };
  };

  const [pendingRequests, setPendingRequests] = useState<PendingRequestRow[]>(
    []
  );
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'competency' | 'role' | null>(
    null
  );
  const [editedCompetency, setEditedCompetency] = useState<{
    [key: string]: number | null;
  }>({});
  const [editedRole, setEditedRole] = useState<{ [key: string]: UserType }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const rowsPerPage = 10;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data, isLoading, mutate } = useSWR(
    `/api/user?page=${page}&limit=${rowsPerPage}`,
    fetcher,
    { keepPreviousData: true }
  );

  const pages = data?.count ? Math.ceil(data.count / rowsPerPage) : 0;

  const users = ((data?.results as UserWithPending[]) || []);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return users.filter((u) => {
      const matchesSearch =
        !q ||
        (u.name ?? '').toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q);

      const matchesRole = roleFilter === 'ALL' ? true : u.role === roleFilter;

      const matchesMHPSS =
        mhpssFilter === 'ALL'
          ? true
          : mhpssFilter === 'NONE'
          ? u.competency == null
          : u.competency === mhpssFilter;

      return matchesSearch && matchesRole && matchesMHPSS;
    });
  }, [users, searchTerm, roleFilter, mhpssFilter]);

  const loadPendingRequests = useCallback(async () => {
    try {
      setPendingLoading(true);
      setPendingMessage(null);

      const res = await fetch('/api/admin/users/role-requests', { method: 'GET' });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setPendingMessage(json?.message || 'Failed to load pending requests.');
        setPendingRequests([]);
        return;
      }

      setPendingRequests(json.data || []);
    } catch {
      setPendingMessage('Failed to load pending requests.');
      setPendingRequests([]);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const actOnRequest = useCallback(
    async (id: string, action: 'APPROVE' | 'REJECT') => {
      try {
        setPendingLoading(true);
        setPendingMessage(null);

        const res = await fetch(`/api/admin/users/role-requests/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success) {
          setPendingMessage(json?.message || 'Action failed.');
          return;
        }

        setPendingRequests((prev) => prev.filter((r) => r.id !== id));
        mutate();
      } catch {
        setPendingMessage('Action failed.');
      } finally {
        setPendingLoading(false);
      }
    },
    [mutate]
  );

  const loadingState =
    isLoading || (data?.results?.length ?? 0) === 0 ? 'loading' : 'idle';

  const handleRoleChange = useCallback(
    async (id: string, value: UserType) => {
      try {
        setIsUpdating(true);
        setEditedRole({ ...editedRole, [id]: value });
        await updateUserRole(id, value);
        mutate((currentData: any) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            results: currentData.results.map((user: User) =>
              user.id === id ? { ...user, role: value } : user
            ),
          };
        }, false);
        setEditingRow(null);
        setEditingField(null);
      } catch (error) {
        console.error('Failed to update role:', error);
      } finally {
        setIsUpdating(false);
      }
    },
    [editedRole, mutate]
  );

  const handleDeleteUser = useCallback(
    async (id: string) => {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      );
      if (!confirmDelete) return;

      try {
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success) {
          alert(json?.message || 'Failed to delete user.');
          return;
        }
        mutate();
      } catch {
        alert('Failed to delete user.');
      }
    },
    [mutate]
  );

  const handleChange = useCallback(
    async (id: string, value: number | null) => {
      try {
        setIsUpdating(true);
        setEditedCompetency({ ...editedCompetency, [id]: value });
        await updateUserCompetency(id, value);
        mutate((currentData: any) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            results: currentData.results.map((user: User) =>
              user.id === id ? { ...user, competency: value } : user
            ),
          };
        }, false);
        setEditingRow(null);
        setEditingField(null);
      } catch (error) {
        console.error('Failed to update competency:', error);
      } finally {
        setIsUpdating(false);
      }
    },
    [editedCompetency, mutate]
  );

  const getRoleIcon = (role: UserType) => {
    switch (role) {
      case UserType.ADMIN:
        return <Shield className="w-4 h-4" />;
      case UserType.RESPONDER:
        return <Users className="w-4 h-4" />;
      case UserType.STANDARD:
        return <UserIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleIconColored = (role: UserType, className = "w-4 h-4") => {
  const color =
    role === UserType.ADMIN
      ? "text-rose-600"
      : role === UserType.RESPONDER
      ? "text-amber-600"
      : "text-emerald-600";

  switch (role) {
    case UserType.ADMIN:
      return <Shield className={`${className} ${color}`} />;
    case UserType.RESPONDER:
      return <Users className={`${className} ${color}`} />;
    case UserType.STANDARD:
      return <UserIcon className={`${className} ${color}`} />;
    default:
      return <UserIcon className={`${className} ${color}`} />;
  }
};

  const getRoleColor = (role: UserType) => {
    switch (role) {
      case UserType.ADMIN:
        return 'danger';
      case UserType.RESPONDER:
        return 'warning';
      case UserType.STANDARD:
        return 'success';
      default:
        return 'default';
    }
  };

  const getCompetencyColor = (competency: number | null) => {
    if (!competency) return 'default';
    switch (competency) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      case 3:
        return 'primary';
      case 4:
        return 'danger';
      default:
        return 'default';
    }
  };

  const tableCols = [
    { key: 'name', name: 'Name' },
    { key: 'email', name: 'Email' },
    { key: 'role', name: 'Role' },
    { key: 'competency', name: 'MHPSS Level' },
    { key: 'createdAt', name: 'Created' },
    { key: 'actions', name: 'Actions' },
  ];

  const renderCell = useCallback(
    (item: UserWithPending, columnKey: string | number) => {
      const competencyValue =
        editingRow === item.id && editingField === 'competency'
          ? editedCompetency[item.id] !== undefined
            ? editedCompetency[item.id]
            : item.competency
          : item.competency;

      const roleValue =
        editingRow === item.id && editingField === 'role'
          ? editedRole[item.id] !== undefined
            ? editedRole[item.id]
            : item.role
          : item.role;

      switch (columnKey) {
        case 'name':
          return (
            <TableCell>
              <div className="flex flex-col">
                <span className="font-mono text-sm font-semibold text-slate-900">
                  {item.name}
                </span>
                <span className="text-xs text-slate-500">
                  ID: {item.id.slice(-8)}
                </span>
              </div>
            </TableCell>
          );

        case 'email':
          return (
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/40 bg-gradient-to-br from-[#4A0707] via-[#6B0F0F] to-[#A11B1B]">
                  {item.email.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-slate-700">{item.email}</span>
              </div>
            </TableCell>
          );

        case 'role':
          return (
            <TableCell
              className={`${
                editingRow === item.id
                  ? 'cursor-pointer rounded-xl bg-white/70 hover:bg-white/85 border border-white/60 transition-all duration-200'
                  : ''
              }`}
              onClick={() => {
                if (editingRow === item.id) setEditingField('role');
              }}
            >
              {editingRow === item.id && editingField === 'role' ? (
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      disabled={isUpdating}
                      size="sm"
                      className="bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm"
                      startContent={<UserCog className="w-4 h-4 text-slate-700" />}
                    >
                      <Chip
                        color={getRoleColor(roleValue)}
                        variant="flat"
                        size="sm"
                        startContent={getRoleIcon(roleValue)}
                        className={maroonTheme.chipPill}
                      >
                        {roleValue}
                        {isUpdating && ' (Saving...)'}
                      </Chip>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disabledKeys={isUpdating ? roleOptions.map(String) : []}
                    onAction={(key) => handleRoleChange(item.id, key as UserType)}
                    className="bg-white/95 backdrop-blur-sm"
                  >
                    {roleOptions.map((option) => (
                      <DropdownItem
                        key={option}
                        textValue={option}
                        startContent={getRoleIcon(option)}
                        className="hover:bg-slate-100/80"
                      >
                        {option}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Chip
                    color={getRoleColor(item.role)}
                    variant="flat"
                    size="sm"
                    startContent={getRoleIcon(item.role)}
                    className={maroonTheme.chipPill}
                  >
                    {item.role}
                  </Chip>

                  {item?.pendingRoleRequest?.status === 'PENDING' && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="warning"
                      className={maroonTheme.chipPill}
                    >
                      Pending → {item.pendingRoleRequest.toRole}
                    </Chip>
                  )}
                </div>
              )}
            </TableCell>
          );

        case 'competency':
          return (
            <TableCell
              className={`text-center ${
                editingRow === item.id
                  ? 'cursor-pointer rounded-xl bg-white/70 hover:bg-white/85 border border-white/60 transition-all duration-200'
                  : ''
              }`}
              onClick={() => {
                if (editingRow === item.id) setEditingField('competency');
              }}
            >
              {editingRow === item.id && editingField === 'competency' ? (
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      disabled={isUpdating}
                      size="sm"
                      className="bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm"
                    >
                      <Chip
                        color={getCompetencyColor(competencyValue)}
                        variant="flat"
                        size="sm"
                        startContent={<Award className="w-3 h-3" />}
                        className={maroonTheme.chipPill}
                      >
                        {competencyValue ? `Level ${competencyValue}` : 'None'}
                        {isUpdating && ' (Saving...)'}
                      </Chip>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disabledKeys={
                      isUpdating
                        ? competencyOptions.map((o) => String(o ?? 'null'))
                        : []
                    }
                    onAction={(key) =>
                      handleChange(item.id, key === 'null' ? null : Number(key))
                    }
                    className="bg-white/95 backdrop-blur-sm"
                  >
                    {competencyOptions.map((option) => (
                      <DropdownItem
                        key={String(option ?? 'null')}
                        textValue={String(option ?? 'None')}
                        startContent={<Award className="w-3 h-3" />}
                        className="hover:bg-slate-100/80"
                      >
                        {option ? `Level ${option}` : 'None'}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <Chip
                  color={getCompetencyColor(item.competency)}
                  variant="flat"
                  size="sm"
                  startContent={<Award className="w-3 h-3" />}
                  className={maroonTheme.chipPill}
                >
                  {item.competency ? `Level ${item.competency}` : 'None'}
                </Chip>
              )}
            </TableCell>
          );

        case 'actions':
          return (
            <TableCell>
              <div className="flex justify-center gap-2">
                <Tooltip content={editingRow === item.id ? 'Cancel Edit' : 'Edit User'}>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className={`${maroonTheme.actionBtnBase} ${maroonTheme.actionEdit}`}
                    onPress={() => {
                      if (editingRow === item.id) {
                        setEditingRow(null);
                        setEditingField(null);
                      } else {
                        setEditingRow(item.id);
                      }
                    }}
                  >
                    {editingRow === item.id ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                  </Button>
                </Tooltip>

                <Tooltip content="Delete User">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className={`${maroonTheme.actionBtnBase} ${maroonTheme.actionDelete}`}
                    onPress={() => handleDeleteUser(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </TableCell>
          );

        case 'createdAt':
          return (
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                  })}
                </span>
              </div>
            </TableCell>
          );

        default:
          return (
            <TableCell className="text-slate-700">
              {item[columnKey as keyof User]?.toString()}
            </TableCell>
          );
      }
    },
    [
      editingRow,
      editedCompetency,
      isUpdating,
      handleChange,
      editingField,
      editedRole,
      handleRoleChange,
      handleDeleteUser,
    ]
  );

  return (
    <div className={`min-h-screen ${maroonTheme.background}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ✅ HERO */}
        <div className={`rounded-[28px] overflow-hidden ${maroonTheme.shell} mb-6`}>
          <div className={`px-6 py-7 bg-gradient-to-r ${maroonTheme.headerGradient}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <h1 className={`text-4xl lg:text-5xl font-black ${maroonTheme.title}`}>
                  User Controller
                </h1>
                <p className={`${maroonTheme.subtitle} mt-2`}>
                  Manage user roles and MHPSS competency levels
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* ✅ Total Users pill (gradient) */}
                <div
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${maroonTheme.statPill}`}
                >
                  <Users className="w-4 h-4 text-white/95" />
                  <span className="text-white font-semibold">
                    {data?.count || 0} Total Users
                  </span>
                </div>

                {/* ✅ Legend button (orange-red gradient) */}
                <Button
                  onPress={onOpen}
                  size="lg"
                  startContent={<Info className="w-5 h-5" />}
                  className={maroonTheme.legendBtn}
                >
                  MHPSS Level Legend
                </Button>
              </div>
            </div>
          </div>

          {/* ✅ Tabs row */}
          <div className={`px-6 py-4 ${maroonTheme.tabWrap}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('USERS')}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                    activeTab === 'USERS' ? maroonTheme.tabActive : maroonTheme.tabIdle
                  }`}
                >
                  Users
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('PENDING');
                    loadPendingRequests();
                  }}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                    activeTab === 'PENDING'
                      ? maroonTheme.tabActive
                      : maroonTheme.tabIdle
                  }`}
                >
                  Pending Requests
                  {pendingRequests.length ? ` (${pendingRequests.length})` : ''}
                </button>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full sm:w-auto">
                {/* ✅ Search */}
                <Input
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  placeholder="Search name or email..."
                  size="sm"
                  variant="bordered"
                  startContent={<Search className="w-4 h-4 text-[#7A0C1E]" />}
                  classNames={{
                    base: 'w-full lg:w-[320px]',
                    inputWrapper:
                      'bg-white/85 backdrop-blur-sm border-2 border-[#A11B1B]/35 shadow-sm ' +
                      'hover:border-[#A11B1B]/60 focus-within:border-[#A11B1B] ' +
                      'focus-within:shadow-[0_0_0_4px_rgba(161,27,27,0.12)] ' +
                      'transition-all',
                    input: 'text-slate-800 placeholder:text-slate-400',
                  }}
                />

                {/* ✅ Role Filter */}
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      variant="bordered"
                      className={`${maroonTheme.filterBtn} w-[160px] justify-between gap-2`}
                      startContent={<Shield className="w-4 h-4" />}
                    >
                      Role: {roleFilter === 'ALL' ? 'All' : roleFilter}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                      aria-label="Filter by role"
                      className={maroonTheme.dropdownMenu}
                      selectionMode="single"
                      selectedKeys={new Set([String(roleFilter)])}
                      onAction={(key) => setRoleFilter(String(key) as UserType | 'ALL')}
                      items={[
                        { key: 'ALL', label: 'All' },
                        ...roleOptions.map((r) => ({ key: String(r), label: String(r) })),
                      ]}
                    >
                      {(item) => (
                        <DropdownItem
                          key={item.key}
                          textValue={item.label}
                          className={maroonTheme.dropdownItem}
                          startContent={
                            item.key === "ALL" ? (
                              <Shield className="w-4 h-4 text-slate-400" />
                            ) : (
                              getRoleIconColored(item.key as UserType)
                            )
                          }
                        >
                          <span className="font-semibold">{item.label}</span>
                        </DropdownItem>
                      )}
                  </DropdownMenu>
                </Dropdown>

                {/* ✅ MHPSS Filter */}
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      variant="bordered"
                      className={`${maroonTheme.filterBtn} w-[140px] justify-between gap-2`}
                      startContent={<Award className="w-4 h-4" />}
                    >
                      MHPSS: {mhpssFilter === 'ALL' ? 'All' : mhpssFilter === 'NONE' ? 'None' : `Level ${mhpssFilter}`}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Filter by MHPSS level"
                    className={maroonTheme.dropdownMenu}
                    selectionMode="single"
                    selectedKeys={new Set([String(mhpssFilter)])}
                    onAction={(key) => {
                      const k = String(key);
                      if (k === 'ALL') return setMhpssFilter('ALL');
                      if (k === 'NONE') return setMhpssFilter('NONE');
                      return setMhpssFilter(Number(k));
                    }}
                    items={[
                      { key: 'ALL', label: 'All' },
                      { key: 'NONE', label: 'None' },
                      ...[1, 2, 3, 4].map((lvl) => ({ key: String(lvl), label: `Level ${lvl}` })),
                    ]}
                  >
                    {(item) => (
                      <DropdownItem
                        key={item.key}
                        textValue={item.label}
                        className={maroonTheme.dropdownItem}
                        startContent={
                          item.key === 'ALL' ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                          ) : item.key === 'NONE' ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                          ) : (
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                item.key === '1'
                                  ? 'bg-emerald-500'
                                  : item.key === '2'
                                  ? 'bg-amber-500'
                                  : item.key === '3'
                                  ? 'bg-blue-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                          )
                        }
                      >
                        <span className="font-semibold">{item.label}</span>
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>

                {/* ✅ Clear filters */}
                {(searchTerm || roleFilter !== 'ALL' || mhpssFilter !== 'ALL') && (
                  <Button
                    size="sm"
                    variant="light"
                    className="text-[#7A0C1E]"
                    startContent={<XCircle className="w-4 h-4" />}
                    onPress={() => {
                      setSearchTerm('');
                      setRoleFilter('ALL');
                      setMhpssFilter('ALL');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ CONTENT */}
        <Card className={maroonTheme.innerPanel}>
          <CardBody className="p-4 sm:p-6">
            {activeTab === 'USERS' ? (
              <>
                <Table
                  aria-label="User Management Table"
                  classNames={{
                    wrapper: 'shadow-none bg-transparent',
                    th: maroonTheme.th,
                    td: maroonTheme.td,
                  }}
                >
                  <TableHeader columns={tableCols}>
                    {(column) => (
                      <TableColumn
                        key={column.key}
                        className="text-center text-sm sm:text-md"
                      >
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>

                  <TableBody
                    emptyContent={
                      <div className="text-center py-14">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-5xl">👥</div>
                          <h3 className="text-xl font-semibold text-slate-800">
                            No Users Found
                          </h3>
                          <p className="text-slate-500">
                            No users are currently available to display.
                          </p>
                        </div>
                      </div>
                    }
                    loadingContent={
                      <div className="flex justify-center py-12">
                        <Spinner size="lg" color="danger" />
                      </div>
                    }
                    loadingState={loadingState}
                  >
                    {filteredUsers.map((item) => (
                      <TableRow key={item.id} className={maroonTheme.rowHover}>
                        {(columnKey) => renderCell(item, columnKey)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {pages > 0 && (
                  <div className="flex w-full justify-center pt-6 border-t border-white/60">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="danger"
                      page={page}
                      total={pages}
                      onChange={setPage}
                      classNames={{
                        wrapper: maroonTheme.paginationWrap,
                        item: maroonTheme.paginationItem,
                        cursor: maroonTheme.paginationCursor,
                        prev: maroonTheme.paginationNav,
                        next: maroonTheme.paginationNav,
                        ellipsis:
                          'text-slate-400 hover:text-[#7A0C1E] transition-colors duration-200',
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-xl font-black text-slate-900">
                      Pending Role Requests
                    </div>
                    <div className="text-sm text-slate-600">
                      Approve or reject role upgrade requests.
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="bordered"
                    className={maroonTheme.ghostBtn}
                    onPress={loadPendingRequests}
                    isDisabled={pendingLoading}
                  >
                    Refresh
                  </Button>
                </div>

                {pendingMessage ? (
                  <div className="text-sm text-[#7A0C1E] bg-[#B91C1C]/10 border border-[#B91C1C]/20 rounded-2xl p-3">
                    {pendingMessage}
                  </div>
                ) : null}

                {pendingLoading ? (
                  <div className="flex justify-center py-10">
                    <Spinner size="lg" color="danger" />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-sm text-slate-600">No pending requests.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {pendingRequests.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-3xl p-4 bg-white/75 border border-white/50 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {r.user?.name || 'Unnamed'}{' '}
                              <span className="font-normal text-slate-500">
                                ({r.user?.email})
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                              <Chip
                                size="sm"
                                variant="flat"
                                className="bg-slate-100 text-slate-700"
                              >
                                From: {r.fromRole}
                              </Chip>
                              <Chip
                                size="sm"
                                variant="flat"
                                className="bg-[#B91C1C]/10 text-[#7A0C1E] border border-[#B91C1C]/20"
                              >
                                To: {r.toRole}
                              </Chip>
                            </div>

                            <div className="text-xs text-slate-500 mt-2">
                              Submitted: {new Date(r.createdAt).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={pendingLoading}
                              onClick={() => actOnRequest(r.id, 'REJECT')}
                              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-slate-200 bg-white/90 hover:bg-slate-50 disabled:opacity-60 shadow-sm hover:shadow-md transition-all"
                            >
                              Reject
                            </button>

                            <button
                              type="button"
                              disabled={pendingLoading}
                              onClick={() => actOnRequest(r.id, 'APPROVE')}
                              className="px-4 py-2 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-[#2A060D] via-[#7A0C1E] to-[#B91C1C] hover:opacity-95 disabled:opacity-60 shadow-md hover:shadow-lg transition-all"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        <MHPSSLevel isOpen={isOpen} onOpenChange={onOpenChange} />
      </div>
    </div>
  );
};

export default UserTable;