"use client"

import { createTransaction } from '@/actions/transaction'
import { transactionSchema } from '@/app/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import CreateAccountDrawer from '@/components/create-account-drawer'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import useFetchs from '@/hooks/use-fetch'


const inputStyle = "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

const AddTransactionForm = ({ accounts, categories }) => {
    const router = useRouter();
    
    const { register, setValue, handleSubmit, formState: { errors }, watch, getValues, reset, } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
        }
    })

    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionResult,
    } = useFetchs(createTransaction);

    const type = watch("type");
    const isRecurring = watch("isRecurring");
    const date = watch("date");

    const onSubmit = async (data) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount)
        };

        transactionFn(formData);
    };

    useEffect (() => {
        if (transactionResult?.success && !transactionLoading){
            toast.success("Transaction created successfully");
            reset();
            router.push(`/account/${transactionResult.data.accountId}`);
        }
    },[transactionResult, transactionLoading])

    const filteredCategories = categories.filter(
        (category) => category.type === type
    )

    return (
        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            {/* Type */}
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Type</label>
                <Select
                    onValueChange={(value) => setValue("type", value)}
                    defaultValue={type}
                >
                    <SelectTrigger className={inputStyle}>
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && (
                    <p className='text-sm text-red-500'>{errors.type.message}</p>
                )}
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
                {/* Amount */}
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Amount</label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("amount")}
                        className={inputStyle}
                    />
                    {errors.amount && (
                        <p className='text-sm text-red-500'>{errors.amount.message}</p>
                    )}
                </div>

                {/* Account */}
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Account</label>
                    <Select
                        onValueChange={(value) => setValue("accountId", value)}
                        defaultValue={getValues("accountId")}
                    >
                        <SelectTrigger className={inputStyle}>
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name} (${parseFloat(account.balance).toFixed(2)})
                                </SelectItem>
                            ))}
                            <CreateAccountDrawer>
                                <Button variant="ghost" className="w-full select-none items-center text-sm outline-none">
                                    Create Account
                                </Button>
                            </CreateAccountDrawer>
                        </SelectContent>
                    </Select>
                    {errors.accountId && (
                        <p className='text-sm text-red-500'>{errors.accountId.message}</p>
                    )}
                </div>
            </div>

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Category</label>
                <Select
                    onValueChange={(value) => setValue("category", value)}
                    defaultValue={getValues("category")}
                >
                    <SelectTrigger className={inputStyle}>
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}

                    </SelectContent>
                </Select>
                {errors.category && (
                    <p className='text-sm text-red-500'>{errors.category.message}</p>
                )}
            </div>

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full pl-3 text-left font-normal">
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align='start'>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => setValue("date", date)}
                            disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                            }
                            intialFocus
                        />
                        
                        
                    </PopoverContent>
                </Popover>

                {errors.date && (
                    <p className='text-sm text-red-500'>{errors.date.message}</p>
                )}
            </div>

            
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Description</label>
                <Input placeholder="Enter description"{...register("description")} />
                {errors.description && (
                    <p className='text-sm text-red-500'>{errors.description.message}</p>
                )}
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                    <label className='text-sm font-medium cursor-pointer'>Recurring Transaction</label>
                    <p className='text-sm text-muted-foreground'>
                        Set up a recurring schedule for this transaction.
                    </p>
                </div>
                <Switch
                    checked = {isRecurring}
                    onCheckedChange={(checked) => setValue("isRecurring", checked)}
                />
            </div>

            {isRecurring && (
                <div className='space-y-2'>
                <label className='text-sm font-medium'>Recurring Interval</label>
                <Select
                    onValueChange={(value) => setValue("recurringInterval", value)}
                    defaultValues={getValues("recurringInterval")}
                >
                    <SelectTrigger className={inputStyle}>
                        <SelectValue placeholder="Select Interval" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value = "DAILY">Daily</SelectItem>
                        <SelectItem value = "WEEKLY">Weekly</SelectItem>
                        <SelectItem value = "MONTHLY">Monthly</SelectItem>
                        <SelectItem value = "YEARLY">Yearly</SelectItem>
                    </SelectContent>
                </Select>
                {errors.recurringInterval && (
                    <p className='text-sm text-red-500'>{errors.recurringInterval.message}</p>
                )}
            </div>
            )}

            <div className='grid gap-6 md:grid-cols-2'>
                <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" className="w-full" disabled={transactionLoading}>Create Transaction</Button>
            </div>
        </form>
    )
}

export default AddTransactionForm
