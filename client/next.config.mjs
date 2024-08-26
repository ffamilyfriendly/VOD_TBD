/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const wpa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
});

export default wpa({
  reactStrictMode: true,
});
