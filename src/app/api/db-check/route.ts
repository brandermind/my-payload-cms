// src/app/api/db-check/route.ts
import { NextResponse } from 'next/server'
import dns from 'node:dns'
import { Client } from 'pg'

function redact(dsn: string) {
  // hide password but show structure
  return dsn.replace(/(postgres:\/\/[^:]+:)[^@]+(@)/, '$1***REDACTED***$2')
}

export async function GET() {
  const url = (process.env.DATABASE_URI || '').trim()
  const report: any = {
    hasEnv: Boolean(url),
    envLen: url.length,
    envPreview: url ? redact(url.slice(0, 120)) + (url.length > 120 ? '…' : '') : null,
    parsed: {} as any,
    dns: null as any,
  }

  try {
    // parse host/port
    const at = url.indexOf('@')
    const afterAt = at > -1 ? url.slice(at + 1) : ''
    const hostPart = afterAt.split('/')[0] // "host:port"
    const host = hostPart.split(':')[0]
    const port = Number(hostPart.split(':')[1]) || NaN
    report.parsed = { host, port, atIndex: at }

    if (host) {
      report.dns = await new Promise((res, rej) =>
        dns.lookup(host, { all: true }, (e, addrs) => (e ? rej(e) : res(addrs)))
      )
    }

    const client = new Client({ connectionString: url })
    await client.connect()
    await client.end()

    report.connected = true
    return NextResponse.json(report)
  } catch (err: any) {
    report.connected = false
    report.error = { code: err.code, message: err.message }
    return NextResponse.json(report, { status: 500 })
  }
}
