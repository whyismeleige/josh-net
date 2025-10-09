import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MaterialsData } from "@/types/material";

export interface MaterialsState {
  data: MaterialsData | null;
}

const initialState: MaterialsState = {
  data: null,
};

export const materialSlice = createSlice({
  name: "material",
  initialState,
  reducers: {
    changeData: (state, action: PayloadAction<MaterialsData>) => {
      state.data = action.payload;
    },
  },
});

export const { changeData } = materialSlice.actions;
export default materialSlice.reducer;
