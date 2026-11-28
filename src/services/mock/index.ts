import type { Services } from "../contracts";
import { mockAuth } from "./auth";
import { mockCatalog } from "./catalog";
import { onExternalChange } from "./db";
import { mockMessages, mockNotifications, mockPlaces } from "./inbox";
import { mockMedia } from "./media";
import { mockOrders } from "./orders";
import { mockSocial } from "./social";
import { mockStudio } from "./studio";
import { mockWaitlist } from "./waitlist";

export const mockServices: Services = {
  waitlist: mockWaitlist,
  auth: mockAuth,
  catalog: mockCatalog,
  social: mockSocial,
  orders: mockOrders,
  notifications: mockNotifications,
  messages: mockMessages,
  places: mockPlaces,
  studio: mockStudio,
  media: mockMedia,
  realtime: {
    subscribe(cb) {
      const off = onExternalChange(cb);
      return () => void off();
    },
  },
};
