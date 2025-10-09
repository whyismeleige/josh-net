import { combineReducers } from "redux";
import materialReducer from "./slices/material.slice";
import { configureStore } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  materials: materialReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;