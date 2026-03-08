/**
 * Validates whether an email domain has MX records.
 * Uses Google DNS-over-HTTPS (DoH) to be Edge-compatible.
 */
export async function isEmailDomainValid(email: string): Promise<boolean> {
    if (!email || !email.includes('@')) return false;

    const domain = email.split('@')[1];
    if (!domain) return false;

    try {
        // Use Google's DNS-over-HTTPS API (MX = 15)
        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
        if (!res.ok) return true; // Fail open if API is down

        const data = await res.json() as any;
        if (data.Status !== 0) return false; // NXDOMAIN or error

        return Array.isArray(data.Answer) && data.Answer.length > 0;
    } catch (err) {
        console.error("DNS MX check failed for", domain, err);
        return true; // fail open on network error
    }
}
