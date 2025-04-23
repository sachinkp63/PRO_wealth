import { getUserAccount } from '@/actions/dashboard'
import React from 'react'
import AddTransactionForm from '../_components/transaction-form';
import { defaultCategories } from '@/data/categories';

const AddTransactionPage = async () => {
    const accounts = await getUserAccount();

  return (
    <div className='max-w-3xl mx-auto px-5'>
        <h1 className='text-5xl pb-6 gradient-title bg-gradient-to-br from-blue-600 to-purple-600 gradient font-extrabold tracking-tighter pr-2 pb-2 text-transparent bg-clip-text'>
            Add Transaction
        </h1>
        <AddTransactionForm accounts = {accounts} categories = {defaultCategories}/>
    </div>
  )
}

export default AddTransactionPage