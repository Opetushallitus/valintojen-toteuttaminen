"use client";
import axios from "axios";

export const client = axios.create({
  headers: {
    Accept: "application/json",
    "Caller-id": "1.2.246.562.10.00000000001.valintojen-toteuttaminen",
    "Content-type": "Application/x-www-form-urlencoded",
    CSRF: "1.2.246.562.10.00000000001.valintojen-toteuttaminen",
  },
});
