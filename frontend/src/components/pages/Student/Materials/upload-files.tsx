import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


export default function UploadMaterialDialog () {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Upload Files</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Upload Files</DialogTitle>
            </DialogContent>
        </Dialog>
    )
}