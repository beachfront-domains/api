


/// export

export function validateDomain(domain: string): boolean {
  try {
    const { origin, protocol } = new URL(String(domain));

    if (origin !== ("null" || null) && protocol === "https:")
      return true;
    else
      return false;
  } catch(_) {
    return false;
  }
}
