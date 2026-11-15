import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  distDir: process.env.BOARD_TEST_MODE === '1' ? '.next-test' : '.next',
}

export default nextConfig
