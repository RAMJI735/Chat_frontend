import React, { Suspense } from 'react'
import { ChatInterface } from '../../../views/ChatInterface'

function page() {
    return (
        <div>
            <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading chat...</div>}>
                <ChatInterface />
            </Suspense>
        </div>
    )
}

export default page