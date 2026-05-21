import { motion } from 'framer-motion'

interface FloatingNoteProps {
  className?: string
  delay?: number
  rotate?: number
  imageSrc: string
  imageAlt?: string
}

export function FloatingNote({
  className = '',
  delay = 0,
  rotate = 0,
  imageSrc,
  imageAlt = 'Note'
}: FloatingNoteProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        rotate: rotate - 5,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      transition={{
        duration: 1.8,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1 },
      }}
      className={className}
      style={{
        position: 'absolute',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{
          y: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export default FloatingNote
