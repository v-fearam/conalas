import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa'

export const PHONE = '2243401378'
export const PHONE_INTERNATIONAL = '542243401378'
export const ADDRESS = 'General Belgrano, Buenos Aires, Argentina'

export const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/disenio.con.alas',
    icon: FaFacebookF,
  },
  {
    label: 'WhatsApp',
    href: `https://wa.me/${PHONE_INTERNATIONAL}`,
    icon: FaWhatsapp,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/disenio.con.alas',
    icon: FaInstagram,
  },
] as const
