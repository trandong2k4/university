import svgPaths from "./svg-63bcduu7i1";

function Group() {
  return (
    <div className="absolute contents inset-[16.67%_8.33%]" data-name="Group">
      <div className="absolute bottom-[66.67%] left-[33.33%] right-1/2 top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.99997 8.00004">
            <path d={svgPaths.p1c6be480} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[33.33%_16.67%_16.67%_16.67%]" data-name="Vector">
        <div className="absolute inset-[-8.33%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 18.6667">
            <path d={svgPaths.p14398d00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_83.33%_41.67%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-1.33px_-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33333 2.66667">
            <path d="M1.33334 1.33334H4" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_8.33%_41.67%_83.33%]" data-name="Vector">
        <div className="absolute inset-[-1.33px_-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33327 2.66667">
            <path d="M1.33334 1.33334H3.99993" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[54.17%_37.5%_37.5%_62.5%]" data-name="Vector">
        <div className="absolute inset-[-50%_-1.33px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.66667 5.33337">
            <path d="M1.33334 1.33334V4.00004" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[54.17%_62.5%_37.5%_37.5%]" data-name="Vector">
        <div className="absolute inset-[-50%_-1.33px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.66667 5.33337">
            <path d="M1.33334 1.33334V4.00004" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[32px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[14px] size-[32px] top-[14px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Container1() {
  return <div className="absolute bg-[#00c950] border-2 border-solid border-white left-[44px] rounded-[33554400px] size-[16px] top-[-4px]" data-name="Container" />;
}

function Text() {
  return <div className="absolute bg-[#155dfc] left-[-27.57px] opacity-2 rounded-[33554400px] size-[115.145px] top-[-27.57px]" data-name="Text" />;
}

export default function LearningSupportWidget() {
  return (
    <div className="border-2 border-solid border-white opacity-83 relative rounded-[33554400px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] size-full" data-name="LearningSupportWidget" style={{ backgroundImage: "linear-gradient(135deg, rgb(43, 127, 255) 0%, rgb(21, 93, 252) 50%, rgb(152, 16, 250) 100%)" }}>
      <Container />
      <Container1 />
      <Text />
    </div>
  );
}