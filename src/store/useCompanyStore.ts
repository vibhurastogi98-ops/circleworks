import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Company {
  id: string;
  name: string;
  logo?: string;
  domain?: string;
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
  };
}

interface CompanyState {
  currentCompany: Company | null;
  companies: Company[];
  setCurrentCompany: (company: Company) => void;
  addCompany: (company: Company) => void;
  updateCompany: (company: Company) => void;
  loadCompanies: () => Promise<void>;
}

// Default company for demo purposes
const DEFAULT_COMPANY: Company = {
  id: 'circleworks-demo',
  name: 'CircleWorks',
  logo: '/logo.svg',
  domain: 'circleworks.vercel.app',
  settings: {
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy'
  }
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      currentCompany: DEFAULT_COMPANY,
      companies: [DEFAULT_COMPANY],

      setCurrentCompany: (company: Company) => {
        set({ currentCompany: company });
      },

      addCompany: (company: Company) => {
        const { companies } = get();
        set({
          companies: [...companies, company],
          currentCompany: company
        });
      },

      updateCompany: (company: Company) => {
        const { companies } = get();
        const updatedCompanies = companies.map(c =>
          c.id === company.id ? company : c
        );
        set({
          companies: updatedCompanies,
          currentCompany: company
        });
      },

      loadCompanies: async () => {
        // In a real app, this would fetch from API
        // For now, just ensure we have the default company
        const { companies } = get();
        if (companies.length === 0) {
          set({
            companies: [DEFAULT_COMPANY],
            currentCompany: DEFAULT_COMPANY
          });
        }
      }
    }),
    {
      name: 'circleworks-company-storage',
      partialize: (state) => ({
        currentCompany: state.currentCompany,
        companies: state.companies
      })
    }
  )
);