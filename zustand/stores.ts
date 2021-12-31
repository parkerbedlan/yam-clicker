import create from "zustand";
import { createGlobalStatePersist } from "./zustandTools";

export const useCount = createGlobalStatePersist<number>(0, "count");
export const useRate = createGlobalStatePersist<number>(0, "rate");

const initialMarketItems = [
  {
    id: 0,
    name: "seed yam",
    cost: 15,
    rateIncrease: 0.1,
    amount: 0,
    threshold: 0,
    visible: true,
    unlocked: false,
  },
  {
    id: 1,
    name: "unpaid intern",
    cost: 100,
    rateIncrease: 1,
    amount: 0,
    threshold: 0,
    visible: true,
    unlocked: false,
  },
  {
    id: 2,
    name: "barn",
    cost: 1100,
    rateIncrease: 8,
    amount: 0,
    threshold: 15,
    visible: false,
    unlocked: false,
  },
];

export type MarketItem = {
  id: number;
  name: string;
  cost: number;
  rateIncrease: number;
  amount: number; // how many are owned
  threshold: number;
  visible: boolean; // true once treshold is reached and stays true
  unlocked: boolean; // true once cost is reached and stays true
};

type MarketItemsStoreState = {
  marketItems: MarketItem[];
  getCache: () => void;
  updateCache: (marketItems: MarketItem[]) => void;
  unlock: (id: number) => void;
  purchase: (id: number) => void;
  makeVisible: (id: number) => void;
};

//TODO: make persistent with getCache and updateCache
export const useMarketItemsStore = create<MarketItemsStoreState>(
  (set, get) => ({
    marketItems: initialMarketItems,
    getCache: () => {
      const cachedValue = window.localStorage.getItem("marketItems");
      const items: MarketItem[] = cachedValue
        ? JSON.parse(cachedValue)
        : initialMarketItems;
      set(() => ({ marketItems: items }));
    },
    updateCache: (marketItems) => {
      window.localStorage.setItem(
        "marketItems",
        "" + JSON.stringify(marketItems)
      );
    },
    purchase: (id) => {
      let items = get().marketItems.slice();
      let item = items[id];
      item.amount += 1;
      item.cost = Math.ceil(item.cost * 1.15);
      items[id] = item;
      set(() => ({ marketItems: items }));
      get().updateCache(items);
    },
    makeVisible: (id) => {
      let items = get().marketItems.slice();
      let item = items[id];
      item.visible = true;
      items[id] = item;
      set(() => ({ marketItems: items }));
      get().updateCache(items);
    },
    unlock: (id) => {
      let items = get().marketItems.slice();
      let item = items[id];
      item.unlocked = true;
      items[id] = item;
      set(() => ({ marketItems: items }));
      get().updateCache(items);
    },
  })
);
