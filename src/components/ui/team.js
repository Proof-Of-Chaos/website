import { faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Team( props ) {
  return(

<section className="py-20 pb-32 bg-black">

    <div className="relative max-w-6xl px-10 mx-auto">
        <div className="flex flex-col items-start justify-start mb-12">
            <h2 className="inline-block mb-2 mr-5 text-4xl font-extrabold tracking-tight text-white">Our Team</h2>
            <p className="text-xl text-gray-400">Meet the awesome team behind Proof of Chaos 🔮</p>
        </div>

        <div className="grid grid-cols-1 gap-10 mt-10 md:grid-cols-2 xl:grid-cols-2">

            <div className="relative rounded-lg p-0.5 overflow-hidden bg-transparent shadow-sm hover:border-gray-400 ">

                <div className="relative z-10 flex items-center w-full h-full px-6 py-5 bg-black rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                        <img className="w-16 h-16 rounded-full" src="https://media-exp1.licdn.com/dms/image/C4D03AQEAYrYp4j87yg/profile-displayphoto-shrink_400_400/0/1602431612585?e=1666224000&v=beta&t=hLA8XjeXf-eRoSHC_YsHisiA55XmsDpS8MbbxozgD1U" alt="Gabriel Jaeger Profile Picture" />
                    </div>
                    <div className="flex-1 min-w-0">

                            <p className="text-lg font-medium text-gray-100">
                                Gabriel Jaeger
                            </p>
                            <p className="text-sm text-gray-400">
                                Founder / CEO
                            </p>

                    </div>
                    <div className="flex-1 flex-grow-0 pr-2 text-gray-200">
                        <div className="relative flex items-center justify-end space-x-3">
                            <a href='https://www.linkedin.com/in/gabriel-jaeger-167811117/' className="text-gray-300 hover:text-gray-200" >
                                <svg className="w-5 h-5 fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0v24h24v-24h-24zm8 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.397-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400 via-purple-400 to-pink-500"></div>

            </div>

            <div className="relative rounded-lg p-0.5 overflow-hidden bg-transparent shadow-sm hover:border-gray-400 ">

                <div className="relative z-10 flex items-center w-full h-full px-6 py-5 bg-black rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                        <img className="w-16 h-16 rounded-full" src="https://images.unsplash.com/photo-1544348817-5f2cf14b88c8?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;crop=face&amp;w=800&amp;h=800&amp;q=80" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">

                            <p className="text-lg font-medium text-gray-100">
                                Thomas M
                            </p>
                            <p className="text-sm text-gray-400">
                                Backend / Blockchain Integration
                            </p>

                    </div>
                    <div className="flex-1 flex-grow-0 pr-2 text-gray-200">
                        <div className="relative flex items-center justify-end space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-400"></div>

            </div>

            <div className="relative rounded-lg p-0.5 overflow-hidden bg-transparent shadow-sm hover:border-gray-400 ">

                <div className="relative z-10 flex items-center w-full h-full px-6 py-5 bg-black rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                        <img className="w-16 h-16 rounded-full" src="https://unavatar.io/twitter/niftesty" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">

                            <p className="text-lg font-medium text-gray-100">
                                niftesty
                            </p>
                            <p className="text-sm text-gray-400">
                                Frontend Developer / UI / UX
                            </p>

                    </div>
                    <div className="flex-1 flex-grow-0 pr-2 text-gray-200">
                        <div className="relative flex items-center justify-end space-x-3">
                            <a href="twitter.com/niftesty" className="text-gray-300 hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                            </a>
                            <a href="https://github.com/niklasp" className="text-gray-300 hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-400"></div>

            </div>

            <div className="relative rounded-lg p-0.5 overflow-hidden bg-transparent shadow-sm hover:border-gray-400 ">

                <div className="relative z-10 flex items-center w-full h-full px-6 py-5 bg-black rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                        <FontAwesomeIcon icon={ faPeopleGroup } color={ '#fff' } className="w-10 h-10" />
                    </div>
                    <div className="flex-1 min-w-0">

                            <p className="text-lg font-medium text-gray-100">
                                The Community
                            </p>
                            <p className="text-sm text-gray-400">
                                Community members in our discord
                            </p>

                    </div>
                    <div className="flex-1 flex-grow-0 pr-2 text-gray-200">
                        <div className="relative flex items-center justify-end space-x-3">
                            <a href="https://discord.gg/ugE6Brwj22" className="text-gray-300 hover:text-gray-200">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 640 512" aria-hidden="true"><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400 via-purple-400 to-pink-500"></div>

            </div>
        </div>
    </div>

</section>


  )
}