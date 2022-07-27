export default function Team( props ) {
  return(

<section className="py-20 pb-32 bg-black">

    <div className="relative max-w-6xl px-10 mx-auto">
        <div className="flex flex-col items-start justify-start mb-12">
            <h2 className="inline-block mb-2 mr-5 text-4xl font-extrabold tracking-tight text-white">Meet the Team</h2>
            <p className="text-xl text-gray-400">Meet the awesome team behind the magic 🔮</p>
        </div>

        <div className="grid grid-cols-1 gap-10 mt-10 md:grid-cols-2 xl:grid-cols-2">

            <div className="relative rounded-lg p-0.5 overflow-hidden bg-transparent shadow-sm hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">

                <div className="relative z-10 flex items-center w-full h-full px-6 py-5 bg-black rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                        <img className="w-16 h-16 rounded-full" src="https://images.unsplash.com/photo-1543984613-f55ca6a1ba35?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;crop=face&amp;w=800&amp;h=800&amp;q=80" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <a href="#_" className="focus:outline-none">

                            <p className="text-lg font-medium text-gray-100">
                                Kevin Jones
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                                Founder / CEO
                            </p>
                        </a>
                    </div>
                    <div className="flex-1 flex-grow-0 pr-2 text-gray-200">
                        <div className="relative flex items-center justify-end space-x-3">
                            <a href="#_" className="text-gray-300 hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                            </a>
                            <a href="#_" className="text-gray-300 hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400 via-purple-400 to-pink-500"></div>

            </div>

            <div className="relative rounded-lg p-0.5 overflow-hidden bg-transparent shadow-sm hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">

                <div className="relative z-10 flex items-center w-full h-full px-6 py-5 bg-black rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                        <img className="w-16 h-16 rounded-full" src="https://images.unsplash.com/photo-1544348817-5f2cf14b88c8?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;crop=face&amp;w=800&amp;h=800&amp;q=80" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <a href="#_" className="focus:outline-none">

                            <p className="text-lg font-medium text-gray-100">
                                Paul Smith
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                                Co-Founder
                            </p>
                        </a>
                    </div>
                    <div className="flex-1 flex-grow-0 pr-2 text-gray-200">
                        <div className="relative flex items-center justify-end space-x-3">
                            <a href="#_" className="text-gray-300 hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                            </a>
                            <a href="#_" className="text-gray-300 hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-400"></div>

            </div>

            <div className="relative rounded-lg p-0.5 overflow-hidden bg-transparent shadow-sm hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">

                <div className="relative z-10 flex items-center w-full h-full px-6 py-5 bg-black rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                        <img className="w-16 h-16 rounded-full" src="https://unavatar.io/twitter/niftesty" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <a href="#_" className="focus:outline-none">

                            <p className="text-lg font-medium text-gray-100">
                                niftesty
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                                Frontend Developer / UI / UX
                            </p>
                        </a>
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

            <div className="relative rounded-lg p-0.5 overflow-hidden bg-transparent shadow-sm hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">

                <div className="relative z-10 flex items-center w-full h-full px-6 py-5 bg-black rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                        <img className="w-16 h-16 rounded-full" src="https://images.unsplash.com/photo-1575299899528-a8a3dbcefc29?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;ixlib=rb-1.2.1&amp;auto=format&amp;fit=crop&amp;w=800&amp;h=800&amp;crop=face&amp;q=80" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <a href="#_" className="focus:outline-none">

                            <p className="text-lg font-medium text-gray-100">
                                Sally Miles
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                                Designer
                            </p>
                        </a>
                    </div>
                    <div className="flex-1 flex-grow-0 pr-2 text-gray-200">
                        <div className="relative flex items-center justify-end space-x-3">
                            <a href="#_" className="text-gray-300 hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                            </a>
                            <a href="#_" className="text-gray-300 hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
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