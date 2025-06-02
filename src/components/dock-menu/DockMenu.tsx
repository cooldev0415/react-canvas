import { Dock } from './Dock'
import { RxHome } from "react-icons/rx";
import { MdOutlineContactMail } from "react-icons/md";
import { BsPersonWorkspace } from "react-icons/bs";
import { HiOutlineUserGroup } from "react-icons/hi";

export const DockMenu = () => {
  const items = [
    { icon: <RxHome size={18} color='white' />, label: 'Home', onClick: () => { } },
    { icon: <BsPersonWorkspace size={18} color='white' />, label: 'Our Work', onClick: () => { } },
    { icon: <MdOutlineContactMail size={18} color='white' />, label: 'Contact Us', onClick: () => { } },
    { icon: <HiOutlineUserGroup size={18} color='white' />, label: 'About Us', onClick: () => { } },
  ];
  return (
    <Dock
      items={items}
      panelHeight={50}
      baseItemSize={40}
      magnification={60}
    />
  )
}