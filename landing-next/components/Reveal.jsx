'use client'
import { motion, useReducedMotion } from 'framer-motion'

// Filmisch onthullen: fade-in + slide-up. Kinderen van <Stagger> verschijnen na elkaar.
const item = {
  hidden: { opacity: 0, y: 48, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

export function Stagger({ children, className = '', delay = 0, gap = 0.14 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  )
}

export function Item({ children, className = '' }) {
  const reduce = useReducedMotion()
  return <motion.div className={`h-full ${className}`} variants={reduce ? { hidden: {}, show: {} } : item}>{children}</motion.div>
}
