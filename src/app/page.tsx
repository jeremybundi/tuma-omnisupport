import SideNav from "../components/SideNav";
import Messages from "../components/Messages";

export default function Page() {
  return (
    <div className="flex w-full">
      <div className="w-[20%]">
        <SideNav />
      </div>
      <div className="w-[30%] border-r-[#E9EBEE] border">
        <Messages />
      </div>
      <div className="w-[50%] p-4">Column 3</div>
    </div>
  );
}
