import { motion } from 'framer-motion'

export function TitleBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-4 relative"
    >
      <h1 className="text-4xl lg:text-6xl font-mono font-bold text-ink">
        WavePose
      </h1>
      <div className="absolute top-4 right-4">
        <p className="text-sm text-gray-600 font-mono">
          created by Andrew Zhou
        </p>
      </div>
    </motion.div>
  )
}
