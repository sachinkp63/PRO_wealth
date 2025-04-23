import { getAccountWithTransactions } from '@/actions/accounts';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import TransactionTable from '../components/transaction-table';
import { BarLoader } from 'react-spinners';
import AccountChart from '../components/account-chart';

const AccountPage = async ({ params }) => {
    const { id } = await params;

    const accountData = await getAccountWithTransactions(id);

    if (!accountData) {
        notFound();
    }

    const { transactions, ...account } = accountData;

    return (

        <div className="space-y-8 px-5 py-6">
            <div className='flex gap-4 items-end justify-between'>
                <div>
                    <h1 className="text-4xl sm:text-5xl pb-6 gradient-title bg-gradient-to-br from-blue-600 to-purple-600 gradient font-extrabold tracking-tighter pr-2 pb-2 text-transparent bg-clip-text capitalize">
                        {account.name}
                    </h1>

                    <p className="text-gray-500 text-sm mt-1">
                        {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
                    </p>
                </div>
                <div className="mt-4 p-4">
                    <div className="text-right">
                        <div className="text-2xl font-semibold text-gray-900">
                            ${parseFloat(account.balance).toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-500">
                            {account._count.transactions} Transactions
                        </p>
                    </div>
                </div>
            </div>
            {/**Chart Section */}
            <Suspense
                fallback={<BarLoader className='mt-4' width={"100%"} color="#9333ea" />}
            >
                <AccountChart transactions={transactions} />
            </Suspense>

            {/*Transaction Table*/}
            <Suspense
                fallback={<BarLoader className='mt-4' width={"100%"} color="#9333ea" />}
            >
                <TransactionTable transactions={transactions} />
            </Suspense>
        </div>
    );
};

export default AccountPage;
