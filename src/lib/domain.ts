import { domainConfig } from '@/config/domain';

export function getSubdomain(host: string) {
  const hostname = host.split(':')[0];

  const root = domainConfig.rootDomain;

  // admin.localhost -> admin
  if (hostname.endsWith(`.${root}`)) {
    return hostname.replace(`.${root}`, '');
  }

  return null;
}
