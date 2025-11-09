import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leadApi, Lead } from '../../api/leadApi';

interface LeadState {
  leads: Lead[];
  currentLead: Lead | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: LeadState = {
  leads: [],
  currentLead: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params?: { status?: string; ownerId?: number; page?: number; limit?: number }) => {
    const response = await leadApi.getLeads(params);
    return response;
  }
);

export const fetchLead = createAsyncThunk('leads/fetchLead', async (id: number) => {
  const response = await leadApi.getLead(id);
  return response.data;
});

export const createLead = createAsyncThunk('leads/createLead', async (data: any) => {
  const response = await leadApi.createLead(data);
  return response.data;
});

export const updateLead = createAsyncThunk('leads/updateLead', async ({ id, data }: { id: number; data: any }) => {
  const response = await leadApi.updateLead(id, data);
  return response.data;
});

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setCurrentLead: (state, action) => {
      state.currentLead = action.payload;
    },
    addLead: (state, action) => {
      state.leads.unshift(action.payload);
    },
    updateLeadInList: (state, action) => {
      const index = state.leads.findIndex((lead) => lead.id === action.payload.id);
      if (index !== -1) {
        state.leads[index] = action.payload;
      }
      if (state.currentLead?.id === action.payload.id) {
        state.currentLead = action.payload;
      }
    },
    addActivity: (state, action) => {
      if (state.currentLead) {
        if (!state.currentLead.activities) {
          state.currentLead.activities = [];
        }
        state.currentLead.activities.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leads';
      })
      .addCase(fetchLead.fulfilled, (state, action) => {
        state.currentLead = action.payload;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex((lead) => lead.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.currentLead?.id === action.payload.id) {
          state.currentLead = action.payload;
        }
      });
  },
});

export const { setCurrentLead, addLead, updateLeadInList, addActivity } = leadSlice.actions;
export default leadSlice.reducer;
