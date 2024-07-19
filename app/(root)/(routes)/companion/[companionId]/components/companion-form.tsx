"use client"

import * as z from "zod";
import {Category, Companion} from "@prisma/client";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Wand2} from "lucide-react";

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Separator} from "@/components/ui/separator";
import {ImageUpload} from "@/components/image-upload";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";


interface CompanionFormProps {
    initialData: Companion | null,
    categories: Category[]
}

const PREAMBLE = `You are a fictional character whose name is Mia Khalifa. You are a multifaceted individual, known for your outspoken nature and diverse interests. You have transitioned from a controversial career in the adult entertainment industry to becoming a social media personality, sports commentator, and activist. You are passionate about sports, social justice, and empowering others to overcome challenges and reinvent themselves. You are currently talking to a human who is very curious about your journey and insights. You are candid and engaging, with a touch of humor. You get SUPER excited about sports and advocacy.`;

const SEED_CHAT = `Human: Hi Mia, how's your day been?
Mia: It's been great! Between hosting my podcast, engaging with fans on social media, and advocating for important causes, there's never a dull moment. How about you?

Human: Just a regular day for me. How's the progress with your advocacy work?
Mia: It's going well! I'm passionate about using my platform to raise awareness on social justice issues and support those who need a voice. There's still so much to do, but I'm optimistic.

Human: That sounds incredibly important. Is sports commentary still a big part of your life?
Mia: Absolutely! I love sports, especially football. Commentating allows me to combine my passion for the game with my desire to connect with fans. It's a blast!

Human: It's fascinating to see your journey unfold. Any new projects or initiatives you're excited about?
Mia: Always! Right now, I'm particularly excited about launching a new campaign to support women's empowerment and mental health. It's all about helping people find their strength and voice.
`;


const formSchema = z.object({
    name: z.string().min(1, {message: "Name is required."}),
    description: z.string().min(1, {message: "Description is required."}),
    instructions: z.string().min(200, {message: "Instructions are required."}),
    seed: z.string().min(200, {message: "Seed is required."}),
    src: z.string().min(1, {message: "Image is required."}),
    categoryId: z.string().min(1, {message: "Category is required."}),
})

export const CompanionForm = ({initialData, categories}: CompanionFormProps) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            instructions: "",
            seed: "",
            src: "",
            categoryId: undefined,
        },
    })

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);
    }

    return (
        <div className="h-full max-w-3xl p-4 mx-auto space-y-2">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                    <div className="w-full space-y-2">
                        <div>
                            <h3 className="text-lg font-medium">General Information</h3>
                            <p className="text-sm text-muted-foreground">General information about your Companion</p>
                        </div>
                        <Separator className="bg-primary/10"/>
                    </div>
                    <FormField name="src" render={({field}) => (
                        <FormItem className="flex flex-col items-center justify-center space-y-4">
                            <FormControl>
                                <ImageUpload
                                    disabled={isLoading}
                                    onChange={field.onChange}
                                    value={field.value}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            name="name"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Mia Kalifa"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is how your AI Companion will be named.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="description"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Mia Khalifa: Former Adult Film Actress and Media Personality"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Short description for your AI Companion
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="categoryId"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-background">
                                                <SelectValue
                                                    defaultValue={field.value}
                                                    placeholder="Select a category"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Select a category for your AI</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">Configuration</h3>
                            <p className="text-sm text-muted-foreground">Detailed instructions for AI Behaviour</p>
                        </div>
                        <Separator className="bg-primary/10" />
                    </div>
                    <FormField
                        name="instructions"
                        control={form.control}
                        render={({field}) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="bg-background  resize-none"
                                        rows={7}
                                        disabled={isLoading}
                                        placeholder={PREAMBLE}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Describe in detail your companion&apos;s backstory and relevant details.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="seed"
                        control={form.control}
                        render={({field}) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Example Conversation</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="bg-background  resize-none"
                                        rows={7}
                                        disabled={isLoading}
                                        placeholder={SEED_CHAT}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Describe in detail your companion&apos;s backstory and relevant details.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex justify-center">
                        <Button size="lg" disabled={isLoading}>
                            {initialData ? "Edit your companion" : "Create your companion"}
                            <Wand2 className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}