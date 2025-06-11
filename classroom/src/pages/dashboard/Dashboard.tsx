import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('welcomeUser', { name: user?.name })}</h2>
        <p className="mb-4">{t('dashboardIntro')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-primary/10 rounded-lg p-4 flex items-center">
            <div className="rounded-full bg-primary/20 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">{t('myClasses')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('manageYourClasses')}</p>
            </div>
          </div>
          
          <div className="bg-green-500/10 rounded-lg p-4 flex items-center">
            <div className="rounded-full bg-green-500/20 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
            </div>            <div>
              <h3 className="font-medium">{t('assignmentsTitle')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('checkYourAssignments')}</p>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 rounded-lg p-4 flex items-center">
            <div className="rounded-full bg-yellow-500/20 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">{t('profile.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('updateYourProfile')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent activity section - placeholder for now */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('recentActivity')}</h2>
        <div className="border-t dark:border-gray-700 py-4">
          <p className="text-gray-500 dark:text-gray-400 text-center">{t('noRecentActivity')}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
