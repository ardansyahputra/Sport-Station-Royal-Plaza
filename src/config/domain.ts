export const domainConfig = {
  rootDomain: process.env.ROOT_DOMAIN!,

  subdomains: {
    admin: process.env.ADMIN_SUBDOMAIN!,
  },

  enableAdminPathRouting: process.env.ENABLE_ADMIN_PATH_ROUTING === 'true',
};
