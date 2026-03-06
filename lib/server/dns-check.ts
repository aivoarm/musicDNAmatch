import dns from 'dns/promises';

/**
 * Validates whether an email domain has MX records.
 * Note: This only works in Node.js environments.
 */
export async function isEmailDomainValid(email: string): Promise<boolean> {
    if (!email || !email.includes('@')) return false;

    const domain = email.split('@')[1];
    if (!domain) return false;

    try {
        const records = await dns.resolveMx(domain);
        return records.length > 0;
    } catch (err) {
        // console.log("DNS MX check failed for", domain, err);
        return false; // domain has no MX records = not a real mail server
    }
}
