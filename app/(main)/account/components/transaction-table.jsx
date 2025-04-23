"use client";

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { categoryColors } from '@/data/categories';
import { format } from 'date-fns';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import React, { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search, Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import useFetch from '@/hooks/use-fetch';
import { bulkDeleteTransactions } from '@/actions/accounts';
import { toast } from 'sonner';
import { BarLoader } from 'react-spinners';


const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
}

const TransactionTable = ({ transactions }) => {

    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        field: "date",
        direction: "desc",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [recurringFilter, setRecurringFilter] = useState("");

    const {
        loading: deleteLoading,
        fn: deleteFn,
        data: deleted,
    } = useFetch(bulkDeleteTransactions)

    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];

        //Apply Serach Filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((transaction) =>
                transaction.description?.toLowerCase().includes(searchLower)
            );
        }

        //Apply recurring filter
        if (recurringFilter) {
            result = result.filter((transaction) => {
                if (recurringFilter === "recurring") return transaction.isRecurring;
                return !transaction.isRecurring
            })
        }

        //Apply type filter
        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter);
        }

        //Apply Sorting
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case "amount":
                    comparison = a.amount - b.amount;
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category);
                    break;
                default:
                    comparison = 0;
            }
            return sortConfig.direction === "asc" ? comparison : -comparison;
        })


        return result;
    }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

    const handleSort = (field) => {
        setSortConfig((current) => ({
            field,
            direction:
                current.field === field && current.direction === 'asc' ? "desc" : "asc"
        }));
    };

    const handleSelect = (id) => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((item) => item != id)
                : [...current, id]
        )
    }

    const handleSelectAll = () => {
        setSelectedIds((current) =>
            current.length === filteredAndSortedTransactions.length
                ? []
                : filteredAndSortedTransactions.map((t) => t.id)
        )
    }

    const handleBulkDelete = async () => {
        if (
            !window.confirm(
                `Are you sure you want to delete ${selectedIds.length} transactions?`
            )
        ) {
            return;
        }
        deleteFn(selectedIds);
    };

    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.error("Transactions deleted successfully");
        }
    }, [deleted, deleteLoading])

    const handleClearFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
        setRecurringFilter("");
        setSelectedIds([]);
    }

    return (
        <div className='space-y-4'>
            {deleteLoading && (
                <BarLoader className='mt-4' width={"100"} color='#9333ea' />
            )}
            {/**Filters */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-8'
                    />
                </div>

                <div className='flex gap-2'>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={recurringFilter} onValueChange={(value) => setRecurringFilter(value)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {selectedIds.length > 0 && (
                        <div className='flex items-center gap-2'>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                <Trash className='h-4 w-4 mr-2' />
                                Delete Selected ({selectedIds.length})
                            </Button>
                        </div>
                    )}

                    {(searchTerm || typeFilter || recurringFilter) && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleClearFilters}
                            title="Clear Filters"
                        >
                            <X className='h-4 w-5' />
                        </Button>
                    )}

                </div>
            </div>

            {/**Transactions */}
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    onCheckedChange={handleSelectAll}
                                    checked={
                                        selectedIds.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0
                                    }
                                />
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                                <div className='flex items-pointer'>
                                    Date{" "}
                                    {sortConfig.field === "date" &&
                                        (sortConfig.direction === "asc" ? (
                                            <ChevronUp className='ml-1 h-4 w-4' />
                                        ) : (
                                            <ChevronDown className='ml-1 h-4 w-4' />
                                        ))
                                    }
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                                <div className='flex items-pointer'>Description</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                                <div className='flex items-center'>
                                    Category{" "}
                                    {sortConfig.field === "category" &&
                                        (sortConfig.direction === "asc" ? (
                                            <ChevronUp className='ml-1 h-4 w-4' />
                                        ) : (
                                            <ChevronDown className='ml-1 h-4 w-4' />
                                        ))
                                    }
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                                <div className='flex items-center justify-end'>
                                    Amount{" "}
                                    {sortConfig.field === "amount" &&
                                        (sortConfig.direction === "asc" ? (
                                            <ChevronUp className='ml-1 h-4 w-4' />
                                        ) : (
                                            <ChevronDown className='ml-1 h-4 w-4' />
                                        ))
                                    }
                                </div>
                            </TableHead>
                            <TableHead>Recurring</TableHead>
                            <TableHead className="w-[50px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No transaction found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedTransactions.map((transactions) => (
                                <TableRow key={transactions.id}>
                                    <TableCell>
                                        <Checkbox
                                            onCheckedChange={() => handleSelect(transactions.id)}
                                            checked={selectedIds.includes(transactions.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(transactions.date), "PP")}
                                    </TableCell>
                                    <TableCell>{transactions.description}</TableCell>
                                    <TableCell className="capitalize">
                                        <span style={{ background: categoryColors[transactions.category], }}
                                            className='px-2 py-1 rounded text-white text-sm'>
                                            {transactions.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium"
                                        style={{ color: transactions.type === "EXPENSE" ? "red" : "green", }}
                                    >
                                        {transactions.type === "EXPENSE" ? "-" : "+"} $
                                        {transactions.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {transactions.isRecurring ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                                                            <RefreshCw className="h-3 w-3" />
                                                            {RECURRING_INTERVALS[
                                                                transactions.recurringInterval
                                                            ]}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <div className='text-sm'>
                                                            <div className='font-medium'>Next Date:</div>
                                                            <div>
                                                                {format(new Date(transactions.date), "PP")}
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <Badge variant="outline" className="gap-1">
                                                <Clock className="h-3 w-3" />
                                                One-Time
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() =>
                                                    router.push(
                                                        `/transaction/create?edit=${transactions.id}`
                                                    )}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => deleteFn([transactions.id])}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>


        </div>
    )
}

export default TransactionTable