import { Button, Input } from '@heroui/react';
import { Dispatch, SetStateAction } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { ChevronDownIcon } from 'lucide-react';

interface Props {
  selectedView: 'teams' | 'events';
  setSelectedView: Dispatch<SetStateAction<'teams' | 'events'>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedFilter: string;
  setSelectedFilter: Dispatch<SetStateAction<string>>;
  showLeaderActions?: boolean;
  onLeaderRequestsClick?: () => void;
}

const MiSaludControls = ({
  selectedView,
  setSelectedView,
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  showLeaderActions = false,
  onLeaderRequestsClick,
}: Props) => {
  const viewOptions = [{ label: 'Teams', value: 'teams' }];

  const teamFilterOptions = [
    { label: 'All Teams', value: 'all' },
    { label: 'Recent Submissions', value: 'recent' },
    { label: 'High Response Rate', value: 'high-response' },
    { label: 'Needs Follow-up', value: 'follow-up' },
    { label: 'Archive', value: 'archive' },
  ];

  const eventFilterOptions = [
    { label: 'All Incidents', value: 'all' },
    { label: 'Recent (7 days)', value: 'recent-7' },
    { label: 'This Month', value: 'this-month' },
    { label: 'High Severity', value: 'high-severity' },
    { label: 'Critical Severity', value: 'critical-severity' },
    { label: 'Archive', value: 'archive' },
  ];

  return (
    <div className="p-6 bg-white/85 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="font-semibold min-w-[200px]"
                color="secondary"
                variant="flat"
                size="lg"
                endContent={<ChevronDownIcon className="size-4" />}
              >
                🔍{' '}
                {teamFilterOptions.find((option) => option.value === selectedFilter)?.label}
              </Button>
            </DropdownTrigger>
            <DropdownMenu className="bg-white/95 backdrop-blur-sm">
              {teamFilterOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  onPress={() => setSelectedFilter(option.value)}
                  className="hover:bg-slate-100/80"
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {showLeaderActions && (
            <Button
              className="font-semibold min-w-[220px]"
              color="success"
              variant="flat"
              size="lg"
              onPress={onLeaderRequestsClick}
            >
              👥 Team Requests
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="w-full lg:w-auto">
          <Input
            placeholder="Search teams and members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-[320px]"
            classNames={{
              input: 'text-slate-700 placeholder:text-slate-500',
              inputWrapper:
                'bg-white/85 backdrop-blur-sm border-2 border-emerald-300/40 shadow-sm ' +
                'hover:border-emerald-500/40 focus-within:border-emerald-600/50 ' +
                'focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] ' +
                'transition-all duration-300 h-12 rounded-2xl',
            }}
            startContent={
              <svg
                className="h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
            endContent={
              searchQuery && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setSearchQuery('')}
                  className="min-w-unit-6 w-6 h-6"
                >
                  <svg
                    className="h-4 w-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MiSaludControls;