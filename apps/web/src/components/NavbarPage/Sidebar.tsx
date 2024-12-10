import { BackpackIcon, BarChartIcon, HomeIcon } from "@radix-ui/react-icons";

const Sidebar = ({children} : {children: React.ReactNode}) => {
    const menus = [
        {title : "Home", icon : <HomeIcon />},
        {title : "About", icon : <BarChartIcon />},
        {title : "Services", icon : <BackpackIcon />},
    ]
  return (
    <div className="flex">
      <aside className="sticky top-0 h-screen w-64 bg-gray-300 p-3 overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {menus.map((menu, index)=> (
            <li key={index} className="text-white p-3 rounded-md flex flex-row gap-1 items-center cursor-pointer hover:bg-gray-400">
                {menu.icon}
                <span>{menu.title}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-4">
       {children}
      </main>
    </div>
  );
};
export default Sidebar