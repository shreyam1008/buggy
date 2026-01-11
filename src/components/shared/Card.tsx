import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  hover = false,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      className={`card ${className}`}
      initial={false}
      whileHover={hover ? { y: -4, boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)' } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">{children}</div>
    </motion.div>
  );
};
