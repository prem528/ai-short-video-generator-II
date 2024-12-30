import Image from 'next/image'

export default function TeamSection() {
    return (
        <div className="min-h-screen  ">

            {/* Mission Statement */}
            <section className="mb-10 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                    <p className="text-xl leading-relaxed">
                        We're on a mission to democratize video creation, making it accessible to everyone.
                        Our AI-powered platform empowers creators, marketers, and businesses to produce
                        high-quality videos effortlessly, unleashing creativity and driving engagement in the digital world.
                    </p>
                </div>
            </section>


            {/* Team Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        { name: 'Name1', role: 'Founder & CEO', image: '/placeholder.svg?height=200&width=200' },
                        { name: 'Name2', role: 'CTO', image: '/placeholder.svg?height=200&width=200' },
                        { name: 'Name3', role: 'Head of AI', image: '/placeholder.svg?height=200&width=200' },
                    ].map((member, index) => (
                        <div key={index} className="text-center">
                            <Image
                                src={member.image}
                                alt={member.name}
                                width={200}
                                height={200}
                                className="rounded-full mx-auto mb-4 border-4 border-blue-400"
                            />
                            <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                            <p className="text-gray-500">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

