module.exports = {
  readPackage(pkg) {
    const approved = [
      '@prisma/client',
      '@prisma/engines',
      'prisma',
      'esbuild',
      'sharp',
      '@tailwindcss/oxide',
      'unrs-resolver',
    ]

    if (approved.includes(pkg.name)) {
      pkg.scripts ??= {}
      pkg.scripts.preinstall = pkg.scripts.preinstall || 'echo approved'
    }

    return pkg
  },
}
