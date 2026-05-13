const dbConnect = require('../../lib/mongoose');
const Client = require('../../models/Client');
const { encodeId } = require('../../utils/hashids');

/**
 * Developer Testing Route.
 * Fetches Active Clients directly by checking if they have consumed any traffic.
 * Secured by a hardcoded query parameter password in production.
 */
export default async function TestLinksPage({ searchParams }) {
    // 1. Define your strong hardcoded password here
    const SECRET_PASSWORD = "HedioumAdmin2026@@1";

    // 2. Await the searchParams promise (CRITICAL FIX FOR NEXT.JS 15+)
    const resolvedSearchParams = await searchParams;
    const providedPassword = resolvedSearchParams?.pw;

    // 3. Validate environment and password
    if (process.env.NODE_ENV === 'production' && providedPassword !== SECRET_PASSWORD) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'monospace', color: '#ef4444' }}>
                🚫 Unauthorized Access
            </div>
        );
    }

    try {
        await dbConnect();

        // Fetch up to 50 clients that have actual usage (up > 0 OR down > 0)
        // Sorted by updatedAt to get the most recently active users.
        const clients = await Client.find({
            $or: [{ up: { $gt: 0 } }, { down: { $gt: 0 } }]
        })
            .sort({ updatedAt: -1 })
            .limit(2000)
            .lean();

        if (!clients || clients.length === 0) {
            return (
                <div style={{ padding: '2rem', direction: 'rtl', fontFamily: 'monospace' }}>
                    <h3>⚠️ هیچ کاربری با مصرف ترافیک (Active) یافت نشد!</h3>
                </div>
            );
        }

        // 4. Dynamically resolve the base URL from the environment, fallback to domain if missing
        const baseUrl = process.env.CLIENT_BASE_URL || 'https://crm.icib.ir';

        return (
            <div style={{ padding: '2rem', fontFamily: 'monospace', direction: 'ltr', background: '#f8fafc', minHeight: '100vh' }}>
                <h2 style={{ borderBottom: '2px solid #cbd5e1', paddingBottom: '1rem', color: '#0f172a' }}>
                    🛠 Developer Test Links (Active Users WITH Usage)
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem' }}>
                    {clients.map((client) => {
                        const clientIdStr = client._id.toString();
                        const hashId = encodeId(clientIdStr);
                        // Using the dynamic base URL instead of hardcoded localhost
                        const subLink = `${baseUrl}/sub/${hashId}`;

                        return (
                            <li key={clientIdStr} style={{ marginBottom: '1.5rem', background: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <p style={{ margin: '0 0 1rem 0', color: '#334155', lineHeight: '1.6' }}>
                                    <strong>Name/Email:</strong> {client.email} <br/>
                                    <strong>DB_ID:</strong> <span style={{ color: '#64748b' }}>{clientIdStr}</span> <br/>
                                    <strong>Usage:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>{((client.up + client.down) / (1024 * 1024)).toFixed(2)} MB</span>
                                </p>
                                <a
                                    href={subLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none', padding: '0.5rem 1rem', background: '#eff6ff', borderRadius: '6px', display: 'inline-block' }}
                                >
                                    🔗 Open Subscription Link
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    } catch (error) {
        return (
            <div style={{ padding: '2rem', color: '#ef4444', direction: 'ltr', fontFamily: 'monospace' }}>
                <h3>❌ System Error:</h3>
                <pre style={{ background: '#fee2e2', padding: '1rem', borderRadius: '8px' }}>{error.message}</pre>
            </div>
        );
    }
}