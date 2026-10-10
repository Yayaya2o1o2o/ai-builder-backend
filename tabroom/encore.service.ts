import { Service } from "encore.dev/service";

// tabroom service: a friendly JSON API on top of www.tabroom.com.
//
// Tabroom has no public API for regular users, so this service signs in to
// Tabroom on the user's behalf (the same way a browser does) and turns the
// pages it gets back into clean JSON for the web app in /web.
export default new Service("tabroom");
